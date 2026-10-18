'use server'

import { getRequestContext } from '@cloudflare/next-on-pages';
import { getTeamContext, CloudflareEnv, getIdentity } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { fetchKeywords } from '@/app/dashboard/keywords/actions';

// ─── Types ───────────────────────────────────────────────────────────────────

export type QueryField =
  // DataForSEO result-level fields
  | 'keyword'             // keyword text (string)
  | 'search_volume'       // keyword_info.search_volume (number)
  | 'cpc'                 // keyword_info.cpc (number)
  | 'competition'         // keyword_info.competition index 0–1 (number)
  | 'competition_level'   // keyword_info.competition_level LOW/MEDIUM/HIGH (enum)
  | 'keyword_difficulty'  // keyword_properties.keyword_difficulty 0–100 (number)
  | 'impressions_etv'     // impressions_etv estimated traffic value (number)
  | 'main_intent'         // search_intent_info.main_intent (enum)
  // Search context fields (from KV cache metadata)
  | 'seed_keyword'        // the seed keyword used to fetch the result set
  | 'location'            // location code from KV metadata
  | 'language'            // language name from KV metadata
  | 'api_type'            // 'labs' | 'live' from KV metadata
  | 'engine';             // 'google' | 'bing' etc. from KV metadata

export type QueryOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte';

export interface QueryClause {
  id: string;
  // first clause has no logicalOperator; subsequent ones are AND/OR
  logicalOperator: 'AND' | 'OR';
  field: QueryField;
  operator: QueryOperator;
  value: string;
}

export interface SavedQuery {
  id: string;
  name: string;
  description: string;
  owner: string;   // email of creator
  sharedWith: string[];  // team IDs this query is shared with
  clauses: QueryClause[];
  createdAt: string;
  updatedAt: string;
}

export interface QueryResultItem {
  keyword: string;
  search_volume?: number;
  cpc?: number;
  competition?: number;
  competition_level?: string;
  keyword_difficulty?: number;
  impressions_etv?: number;
  main_intent?: string;
  source: {
    seed_keyword: string;
    location: string;
    language: string;
    api_type: string;
    engine: string;
  };
}

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const ClauseSchema = z.object({
  id: z.string().min(1).max(36),
  logicalOperator: z.enum(['AND', 'OR']),
  field: z.enum(['keyword', 'seed_keyword', 'search_volume', 'cpc', 'competition', 'competition_level', 'keyword_difficulty', 'impressions_etv', 'main_intent', 'location', 'language', 'api_type', 'engine']),
  operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'gt', 'lt', 'gte', 'lte']),
  value: z.string().max(500),
});

const SaveQuerySchema = z.object({
  id: z.string().max(36).optional(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().default(''),
  clauses: z.array(ClauseSchema).min(1).max(20),
});

// ─── Helper: evaluate one clause against a result item ───────────────────────

function evaluateClause(item: QueryResultItem, clause: QueryClause): boolean {
  // Resolve the value to compare from the result item
  let fieldValue: string | number | undefined;

  switch (clause.field) {
    case 'keyword':            fieldValue = item.keyword; break;
    case 'seed_keyword':       fieldValue = item.source.seed_keyword; break;
    case 'search_volume':      fieldValue = item.search_volume; break;
    case 'cpc':                fieldValue = item.cpc; break;
    case 'competition':        fieldValue = item.competition; break;
    case 'competition_level':  fieldValue = item.competition_level; break;
    case 'keyword_difficulty': fieldValue = item.keyword_difficulty; break;
    case 'impressions_etv':    fieldValue = item.impressions_etv; break;
    case 'main_intent':        fieldValue = item.main_intent; break;
    case 'location':           fieldValue = item.source.location; break;
    case 'language':           fieldValue = item.source.language; break;
    case 'api_type':           fieldValue = item.source.api_type; break;
    case 'engine':             fieldValue = item.source.engine; break;
    default: return false;
  }

  // Undefined values never match (except not_equals which should return true)
  if (fieldValue === undefined || fieldValue === null) {
    return clause.operator === 'not_equals' || clause.operator === 'not_contains';
  }

  const clauseValue = clause.value.toLowerCase().trim();

  // String operators
  if (typeof fieldValue === 'string') {
    const fv = fieldValue.toLowerCase();
    switch (clause.operator) {
      case 'equals':      return fv === clauseValue;
      case 'not_equals':  return fv !== clauseValue;
      case 'contains':    return fv.includes(clauseValue);
      case 'not_contains': return !fv.includes(clauseValue);
      case 'starts_with': return fv.startsWith(clauseValue);
      case 'ends_with':   return fv.endsWith(clauseValue);
      // Number operators on strings make no sense; skip
      default: return false;
    }
  }

  // Number operators
  if (typeof fieldValue === 'number') {
    const clauseNum = parseFloat(clause.value);
    if (isNaN(clauseNum)) return false;
    switch (clause.operator) {
      case 'equals':     return fieldValue === clauseNum;
      case 'not_equals': return fieldValue !== clauseNum;
      case 'gt':         return fieldValue > clauseNum;
      case 'lt':         return fieldValue < clauseNum;
      case 'gte':        return fieldValue >= clauseNum;
      case 'lte':        return fieldValue <= clauseNum;
      // String operators on numbers: convert to string first
      case 'contains':   return String(fieldValue).includes(clause.value);
      case 'not_contains': return !String(fieldValue).includes(clause.value);
      default: return false;
    }
  }

  return false;
}

// ─── Helper: evaluate all clauses against an item (left-to-right AND/OR) ─────

function matchesClauses(item: QueryResultItem, clauses: QueryClause[]): boolean {
  if (clauses.length === 0) return true;

  // Start with result of first clause
  let result = evaluateClause(item, clauses[0]);

  for (let i = 1; i < clauses.length; i++) {
    const clause = clauses[i];
    const match = evaluateClause(item, clause);
    if (clause.logicalOperator === 'AND') {
      result = result && match;
    } else {
      result = result || match;
    }
  }

  return result;
}

// ─── Server Actions ───────────────────────────────────────────────────────────

/**
 * Save (create or update) a query. Returns the saved query or an error.
 */
export async function saveQuery(input: {
  id?: string;
  name: string;
  description?: string;
  clauses: QueryClause[];
}) {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const email = await getIdentity(env);

  // Validate input
  const parsed = SaveQuerySchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'Invalid query: ' + parsed.error.issues[0]?.message };
  }

  const now = new Date().toISOString();
  let existing: SavedQuery | null = null;

  // If updating, verify ownership
  if (input.id) {
    const raw = await env.dfsui.get(`query:${input.id}`);
    if (!raw) return { error: 'Query not found.' };
    existing = JSON.parse(raw) as SavedQuery;
    if (existing.owner !== email) return { error: 'Not authorized to edit this query.' };
  }

  const queryId = input.id || crypto.randomUUID();

  const query: SavedQuery = {
    id: queryId,
    name: parsed.data.name,
    description: parsed.data.description || '',
    owner: email,
    sharedWith: existing?.sharedWith || [],
    clauses: parsed.data.clauses,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  // Save the query definition
  await env.dfsui.put(`query:${queryId}`, JSON.stringify(query));

  // If new query, add to user's list
  if (!input.id) {
    const rawList = await env.dfsui.get(`user:${email}:queries`);
    const list: string[] = rawList ? JSON.parse(rawList) : [];
    if (!list.includes(queryId)) list.push(queryId);
    await env.dfsui.put(`user:${email}:queries`, JSON.stringify(list));
  }

  revalidatePath('/dashboard/queries');
  return { query };
}

/**
 * Get all queries visible to the current user (owned + shared via active team).
 */
export async function getQueries(): Promise<{ myQueries: SavedQuery[]; sharedQueries: SavedQuery[] }> {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { email, activeTeam } = await getTeamContext(env);

  // Load user's own query IDs
  const rawUserList = await env.dfsui.get(`user:${email}:queries`);
  const userQueryIds: string[] = rawUserList ? JSON.parse(rawUserList) : [];

  // Load team's shared query IDs
  const rawTeamList = await env.dfsui.get(`team:${activeTeam.id}:queries`);
  const teamQueryIds: string[] = rawTeamList ? JSON.parse(rawTeamList) : [];

  // Fetch all query definitions in parallel
  const allIds = [...new Set([...userQueryIds, ...teamQueryIds])];
  const queryDefs = await Promise.all(
    allIds.map(async (id) => {
      const raw = await env.dfsui.get(`query:${id}`);
      if (!raw) return null;
      return JSON.parse(raw) as SavedQuery;
    })
  );

  const validDefs = queryDefs.filter(Boolean) as SavedQuery[];

  const myQueries = validDefs.filter(q => q.owner === email);
  // Shared = owned by someone else but visible via team
  const sharedQueries = validDefs.filter(q => q.owner !== email && teamQueryIds.includes(q.id));

  return { myQueries, sharedQueries };
}

/**
 * Get a single query by ID (only if owner or it's shared with active team).
 */
export async function getQuery(id: string): Promise<SavedQuery | null> {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { email, activeTeam } = await getTeamContext(env);

  // Validate ID format
  if (!/^[a-f0-9-]{36}$/.test(id)) return null;

  const raw = await env.dfsui.get(`query:${id}`);
  if (!raw) return null;

  const query = JSON.parse(raw) as SavedQuery;

  // Access check: owner or shared with active team
  const isOwner = query.owner === email;
  const isShared = query.sharedWith.includes(activeTeam.id);
  if (!isOwner && !isShared) return null;

  return query;
}

/**
 * Delete a query (owner only).
 */
export async function deleteQuery(id: string) {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const email = await getIdentity(env);

  if (!/^[a-f0-9-]{36}$/.test(id)) return { error: 'Invalid query ID.' };

  const raw = await env.dfsui.get(`query:${id}`);
  if (!raw) return { error: 'Query not found.' };

  const query = JSON.parse(raw) as SavedQuery;
  if (query.owner !== email) return { error: 'Not authorized to delete this query.' };

  // Delete the query definition
  await env.dfsui.delete(`query:${id}`);

  // Remove from user's list
  const rawList = await env.dfsui.get(`user:${email}:queries`);
  if (rawList) {
    const list: string[] = JSON.parse(rawList);
    const filtered = list.filter(qid => qid !== id);
    await env.dfsui.put(`user:${email}:queries`, JSON.stringify(filtered));
  }

  // Remove from any team lists it was shared to
  for (const teamId of query.sharedWith) {
    const rawTeamList = await env.dfsui.get(`team:${teamId}:queries`);
    if (rawTeamList) {
      const teamList: string[] = JSON.parse(rawTeamList);
      const filtered = teamList.filter(qid => qid !== id);
      await env.dfsui.put(`team:${teamId}:queries`, JSON.stringify(filtered));
    }
  }

  revalidatePath('/dashboard/queries');
  return { success: true };
}

/**
 * Share or unshare a query with the user's active team (owner only).
 */
export async function toggleShareQuery(id: string) {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { email, activeTeam } = await getTeamContext(env);

  if (!/^[a-f0-9-]{36}$/.test(id)) return { error: 'Invalid query ID.' };

  const raw = await env.dfsui.get(`query:${id}`);
  if (!raw) return { error: 'Query not found.' };

  const query = JSON.parse(raw) as SavedQuery;
  if (query.owner !== email) return { error: 'Not authorized to share this query.' };

  const teamId = activeTeam.id;
  const isAlreadyShared = query.sharedWith.includes(teamId);

  // Toggle shared status on the query definition
  if (isAlreadyShared) {
    query.sharedWith = query.sharedWith.filter(t => t !== teamId);
  } else {
    query.sharedWith.push(teamId);
  }
  query.updatedAt = new Date().toISOString();
  await env.dfsui.put(`query:${id}`, JSON.stringify(query));

  // Update the team's query list
  const rawTeamList = await env.dfsui.get(`team:${teamId}:queries`);
  const teamList: string[] = rawTeamList ? JSON.parse(rawTeamList) : [];
  if (isAlreadyShared) {
    const filtered = teamList.filter(qid => qid !== id);
    await env.dfsui.put(`team:${teamId}:queries`, JSON.stringify(filtered));
  } else {
    if (!teamList.includes(id)) teamList.push(id);
    await env.dfsui.put(`team:${teamId}:queries`, JSON.stringify(teamList));
  }

  revalidatePath('/dashboard/queries');
  return { shared: !isAlreadyShared };
}

/**
 * Run a query against DataForSEO data.
 *
 * Two modes:
 *  1. SEARCH MODE  — when a `seed_keyword equals <value>` clause is present:
 *     Fetches keyword data from DataForSEO (or KV cache) for that seed, then
 *     applies all remaining clauses as filters on the returned items.
 *
 *  2. CACHE SCAN MODE — when no seed_keyword clause is present:
 *     Scans the user's existing KV cache and applies all clauses as filters.
 */
export async function runQuery(clauses: QueryClause[]): Promise<{ results: QueryResultItem[]; scanned: number; error?: string; mode?: string }> {
  if (!clauses || clauses.length === 0) {
    return { results: [], scanned: 0, error: 'No clauses defined.' };
  }

  // ── Detect SEARCH MODE ──────────────────────────────────────────────────────
  const seedClause = clauses.find(
    c => c.field === 'seed_keyword' && c.operator === 'equals' && c.value.trim()
  );

  if (seedClause) {
    // Extract optional search-parameter clauses (single equals values only)
    const pick = (field: QueryField) =>
      clauses.find(c => c.field === field && c.operator === 'equals')?.value;

    const seedKeyword  = seedClause.value.trim();
    const location     = pick('location')  || '2840';
    const language     = pick('language')  || 'English';
    const apiTypeRaw   = pick('api_type');
    const apiType: 'labs' | 'live' = apiTypeRaw === 'live' ? 'live' : 'labs';
    const engine       = pick('engine')    || 'google';

    // Fetch (uses KV cache if available, otherwise hits DataForSEO)
    const { results: rawItems, error } = await fetchKeywords(
      seedKeyword, location, apiType, 'keyword_suggestions', engine, language
    );
    if (error) return { results: [], scanned: 0, error };

    // Build source for all result items from this fetch
    const source = { seed_keyword: seedKeyword, location, language, api_type: apiType, engine };

    // Map raw keyword items to QueryResultItem
    const mapped: QueryResultItem[] = (rawItems as any[]).map(item => ({
      keyword:            item.keyword || '',
      search_volume:      item.keyword_info?.search_volume,
      cpc:                item.keyword_info?.cpc,
      competition:        item.keyword_info?.competition,
      competition_level:  item.keyword_info?.competition_level,
      keyword_difficulty: item.keyword_properties?.keyword_difficulty,
      impressions_etv:    item.impressions_etv,
      main_intent:        item.search_intent_info?.main_intent,
      source,
    }));

    // Apply filter clauses — skip the "search parameter" clauses used above
    const searchParamFields = new Set<QueryField>(['seed_keyword', 'location', 'language', 'api_type', 'engine']);
    const filterClauses = clauses.filter(
      c => !searchParamFields.has(c.field) || c.operator !== 'equals'
    );

    const filtered = filterClauses.length > 0
      ? mapped.filter(item => matchesClauses(item, filterClauses))
      : mapped;

    return {
      results: filtered.sort((a, b) => (b.search_volume || 0) - (a.search_volume || 0)).slice(0, 1000),
      scanned: rawItems.length,
      mode: 'search',
    };
  }

  // ── CACHE SCAN MODE ─────────────────────────────────────────────────────────
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const email = await getIdentity(env);

  // List all cached keyword keys for this user (up to 100 searches)
  const list = await env.dfsui.list({ prefix: `keywords:${email}:` });
  const keys = list.keys.slice(0, 100);

  if (keys.length === 0) {
    return {
      results: [],
      scanned: 0,
      error: 'No cached keyword data found. Add a "Seed Keyword = your keyword" clause to fetch live data from DataForSEO.',
      mode: 'cache',
    };
  }

  // Pre-filter keys by metadata-level clauses (location, language, api_type, engine)
  const metaFields: QueryField[] = ['location', 'language', 'api_type', 'engine'];
  const metaClauses = clauses.filter(c => metaFields.includes(c.field));
  const itemClauses = clauses.filter(c => !metaFields.includes(c.field));

  const filteredKeys = keys.filter(key => {
    const meta = key.metadata as any;
    if (!meta || metaClauses.length === 0) return true;
    const metaItem: QueryResultItem = {
      keyword: '',
      source: {
        seed_keyword: meta.keyword || '',
        location: meta.location || '',
        language: meta.language || '',
        api_type: meta.apiType || '',
        engine: meta.engine || '',
      }
    };
    return matchesClauses(metaItem, metaClauses);
  });

  const results: QueryResultItem[] = [];
  let scanned = 0;

  await Promise.all(
    filteredKeys.map(async (key) => {
      const meta = key.metadata as any;
      const raw = await env.dfsui.get(key.name);
      if (!raw) return;
      try {
        const items = JSON.parse(raw) as any[];
        scanned += items.length;
        items.forEach(item => {
          const resultItem: QueryResultItem = {
            keyword:            item.keyword || '',
            search_volume:      item.keyword_info?.search_volume,
            cpc:                item.keyword_info?.cpc,
            competition:        item.keyword_info?.competition,
            competition_level:  item.keyword_info?.competition_level,
            keyword_difficulty: item.keyword_properties?.keyword_difficulty,
            impressions_etv:    item.impressions_etv,
            main_intent:        item.search_intent_info?.main_intent,
            source: {
              seed_keyword: meta?.keyword || '',
              location: meta?.location || '',
              language: meta?.language || '',
              api_type: meta?.apiType || '',
              engine: meta?.engine || '',
            }
          };
          if (itemClauses.length === 0 || matchesClauses(resultItem, itemClauses)) {
            results.push(resultItem);
          }
        });
      } catch {
        // Skip corrupted cache entries
      }
    })
  );

  // Deduplicate by keyword, keep highest volume instance
  const seen = new Map<string, QueryResultItem>();
  results.forEach(item => {
    const existing = seen.get(item.keyword);
    if (!existing || (item.search_volume || 0) > (existing.search_volume || 0)) {
      seen.set(item.keyword, item);
    }
  });

  const deduped = Array.from(seen.values())
    .sort((a, b) => (b.search_volume || 0) - (a.search_volume || 0))
    .slice(0, 1000);

  return { results: deduped, scanned, mode: 'cache' };
}
