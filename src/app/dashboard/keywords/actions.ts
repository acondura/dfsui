'use server'

import { getRequestContext } from '@cloudflare/next-on-pages';
import { getTeamContext, CloudflareEnv, getIdentity } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface KeywordItem {
  keyword: string;
  keyword_info?: {
    search_volume?: number;
    cpc?: number;
  };
}

export async function fetchKeywords(keyword: string, location: string, mode: 'labs' | 'live', bypassCache = false) {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const email = await getIdentity(env);
  const locCode = parseInt(location) || 2840;
  const kvKey = `keywords_v2:${email}:${locCode}:${mode}:${keyword.replace(/\s+/g, '_')}`;

  if (!bypassCache) {
    const cached = await env.dfsui.get(kvKey);
    if (cached) {
      console.log(`[KV Cache Hit] Keywords: ${keyword}`);
      return { results: JSON.parse(cached), cost: 0 };
    }
  }

  const { dfsUser, dfsPass } = await getTeamContext(env);
  if (!dfsUser || !dfsPass) return { results: [], cost: 0, error: "Credentials missing." };

  const auth = btoa(`${dfsUser}:${dfsPass}`);
  const endpoint = mode === 'labs'
    ? 'https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live'
    : 'https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live';


  const payload = mode === 'labs' 
    ? [{ keywords: [keyword], location_code: locCode, language_name: "English", limit: 1000 }]
    : [{ keywords: [keyword], location_code: locCode, language_code: 1000, include_seed_keyword: true }];

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json() as any;
    const task = data.tasks?.[0];
    if (task && task.status_code >= 40000) return { results: [], cost: 0, error: task.status_message };

    const rawItems = task?.result?.[0]?.items || [];
    const results = mode === 'labs' 
      ? rawItems.map((i: any) => ({
          keyword: i.keyword || i.keyword_data?.keyword || 'Unknown',
          keyword_info: i.keyword_info || i.keyword_data?.keyword_info
        }))
      : rawItems;

    if (results.length > 0) {
      await env.dfsui.put(kvKey, JSON.stringify(results), { 
        expirationTtl: 604800,
        metadata: { timestamp: Date.now() }
      });
      console.log(`[KV Cache Miss] Saved keywords: ${keyword}`);
    }

    revalidatePath('/dashboard/keywords'); 
    return { results, cost: task?.cost || 0 };
  } catch (_e) { return { results: [], cost: 0, error: "API Connection Failed" }; }
}

export async function fetchRecentQueries() {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const email = await getIdentity(env);
  
  try {
    const list = await env.dfsui.list({ prefix: `keywords_v2:${email}:` });
    const queries = list.keys.map(key => {
      const parts = key.name.split(':');
      const timestamp = (key.metadata as any)?.timestamp || 0;
      return {
        location: parts[2],
        mode: parts[3] as 'labs' | 'live',
        keyword: parts.slice(4).join(':').replace(/_/g, ' '),
        timestamp
      };
    });
    
    // Sort by timestamp descending
    return queries.sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    return [];
  }
}


export async function getLocations(mode: 'labs' | 'live') {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { dfsUser, dfsPass } = await getTeamContext(env);
  const auth = btoa(`${dfsUser}:${dfsPass}`);
  const url = mode === 'labs' 
    ? 'https://api.dataforseo.com/v3/dataforseo_labs/locations_and_languages'
    : 'https://api.dataforseo.com/v3/keywords_data/google_ads/locations';
  try {
    const res = await fetch(url, { headers: { 'Authorization': `Basic ${auth}` } });
    const data = await res.json() as any;
    return data.tasks?.[0]?.result || [];
  } catch (_e) { return []; }
}

/**
 * 10X Audit with KV Caching
 */
export async function analyzeCompetition(keyword: string, locationCode: string, bypassCache = false) {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const email = await getIdentity(env);
  const kvKey = `audit:${email}:${locationCode}:${keyword.replace(/\s+/g, '_')}`;

  // 1. Try KV First (unless bypass requested)
  if (!bypassCache) {
    const cached = await env.dfsui.get(kvKey);
    if (cached) {
      console.log(`[KV Cache Hit] ${keyword}`);
      return { analysis: JSON.parse(cached), cost: 0, cached: true };
    }
  }

  // 2. Fallback to API
  const { dfsUser, dfsPass } = await getTeamContext(env);
  const auth = btoa(`${dfsUser}:${dfsPass}`);

  try {
    const res = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/regular', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([{ 
        keyword, 
        location_code: parseInt(locationCode) || 2840,
        language_name: "English",
        limit: 10 
      }])
    });

    const data = await res.json() as any;
    const items = data.tasks?.[0]?.result?.[0]?.items || [];

    const analysis = items
      .filter((item: any) => item.type === "organic" && item.url)
      .map((item: any) => {
        const kw = keyword.toLowerCase();
        const metrics = {
          url: (item.url || "").toLowerCase().includes(kw.replace(/\s+/g, '-')),
          title: (item.title || "").toLowerCase().includes(kw),
          description: (item.description || "").toLowerCase().includes(kw),
          h1: false 
        };
        let hostname = 'unknown';
        try { hostname = new URL(item.url).hostname; } catch (e) {}
        return { domain: hostname, url: item.url, score: Object.values(metrics).filter(Boolean).length * 25, metrics };
      });

    // 3. Save to KV for next time (expires in 7 days)
    if (analysis.length > 0) {
      await env.dfsui.put(kvKey, JSON.stringify(analysis), { expirationTtl: 604800 });
      console.log(`[KV Cache Miss] Saved ${keyword}`);
    }

    return { analysis, cost: data.tasks?.[0]?.cost || 0, cached: false };
  } catch (_e) { return { analysis: [], cost: 0, cached: false }; }
}