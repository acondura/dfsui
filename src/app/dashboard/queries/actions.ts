'use server'

import { getRequestContext } from '@cloudflare/next-on-pages';
import { getTeamContext, CloudflareEnv, getIdentity } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ─── Types ───────────────────────────────────────────────────────────────────

export type QueryField =
  | 'keyword'        // keyword text from results
  | 'seed_keyword'   // the seed keyword used to fetch the result set
  | 'search_volume'  // number from keyword_info.search_volume
  | 'cpc'            // number from keyword_info.cpc
  | 'competition'    // number from keyword_info.competition_index
  | 'main_intent'    // string from search_intent_info.main_intent
  | 'location'       // location code from KV metadata
  | 'language'       // language name from KV metadata
  | 'api_type'       // 'labs' | 'live' from KV metadata
  | 'engine';        // 'google' | 'bing' etc. from KV metadata

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
  field: z.enum(['keyword', 'seed_keyword', 'search_volume', 'cpc', 'competition', 'main_intent', 'location', 'language', 'api_type', 'engine']),
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
    case 'keyword':       fieldValue = item.keyword; break;
    case 'seed_keyword':  fieldValue = item.source.seed_keyword; break;
    case 'search_volume': fieldValue = item.search_volume; break;
    case 'cpc':           fieldValue = item.cpc; break;
    case 'competition':   fieldValue = item.competition; break;
    case 'main_intent':   fieldValue = item.main_intent; break;
    case 'location':      fieldValue = item.source.location; break;
    case 'language':      fieldValue = item.source.language; break;
    case 'api_type':      fieldValue = item.source.api_type; break;
    case 'engine':        fieldValue = item.source.engine; break;
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
 * Run a query: scan the user's cached keyword results and apply clause filters.
 * Returns matched keyword items (up to 1000 results across all cached searches).
 */
export async function runQuery(clauses: QueryClause[]): Promise<{ results: QueryResultItem[]; scanned: number; error?: string }> {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const email = await getIdentity(env);

  // Validate clauses
  if (!clauses || clauses.length === 0) {
    return { results: [], scanned: 0, error: 'No clauses defined.' };
  }

  // List all cached keyword keys for this user (up to 100 keyword searches)
  const list = await env.dfsui.list({ prefix: `keywords:${email}:` });
  const keys = list.keys.slice(0, 100);

  if (keys.length === 0) {
    return { results: [], scanned: 0 };
  }

  // Separate clauses that can pre-filter KV keys (metadata-only filters)
  const metaFields: QueryField[] = ['seed_keyword', 'location', 'language', 'api_type', 'engine'];
  const metaClauses = clauses.filter(c => metaFields.includes(c.field));
  const itemClauses = clauses.filter(c => !metaFields.includes(c.field));

  // Pre-filter keys using metadata to avoid unnecessary KV reads
  const filteredKeys = keys.filter(key => {
    const meta = key.metadata as any;
    if (!meta) return true; // no metadata, can't pre-filter

    // Build a mock item from metadata to evaluate meta clauses
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

  // Fetch cached results for filtered keys in parallel
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
            keyword: item.keyword || '',
            search_volume: item.keyword_info?.search_volume,
            cpc: item.keyword_info?.cpc,
            competition: item.keyword_info?.competition_index,
            main_intent: item.search_intent_info?.main_intent,
            source: {
              seed_keyword: meta?.keyword || '',
              location: meta?.location || '',
              language: meta?.language || '',
              api_type: meta?.apiType || '',
              engine: meta?.engine || '',
            }
          };

          // Apply item-level clauses (only if it also matches meta clauses — already pre-filtered above)
          if (itemClauses.length === 0 || matchesClauses(resultItem, itemClauses)) {
            results.push(resultItem);
          }
        });
      } catch {
        // Skip corrupted cache entries
      }
    })
  );

  // Deduplicate by keyword (keep highest volume)
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

  return { results: deduped, scanned };
}
