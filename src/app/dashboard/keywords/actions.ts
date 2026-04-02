'use server'

import { getRequestContext } from '@cloudflare/next-on-pages';
import { getTeamContext, CloudflareEnv } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export interface KeywordItem {
  keyword: string;
  keyword_info?: {
    search_volume?: number;
    cpc?: number;
  };
}

export async function fetchKeywords(keyword: string, location: string, mode: 'labs' | 'live') {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { dfsUser, dfsPass } = await getTeamContext(env);
  if (!dfsUser || !dfsPass) return { results: [], cost: 0, error: "Credentials missing." };

  const auth = btoa(`${dfsUser}:${dfsPass}`);
  const endpoint = mode === 'labs'
    ? 'https://api.dataforseo.com/v3/dataforseo_labs/google/related_keywords/live'
    : 'https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live';

  const locCode = parseInt(location) || 2840;
  const payload = mode === 'labs' 
    ? [{ keyword, location_code: locCode, language_name: "English", limit: 20 }]
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
          keyword: i.keyword_data?.keyword || 'Unknown',
          keyword_info: i.keyword_data?.keyword_info
        }))
      : rawItems;

    revalidatePath('/dashboard/keywords'); 
    return { results, cost: task?.cost || 0 };
  } catch (_e) { return { results: [], cost: 0, error: "API Connection Failed" }; }
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

export async function analyzeCompetition(keyword: string, locationCode: string) {
  const { env } = getRequestContext() as { env: CloudflareEnv };
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
          h1: false // SERP API provides title/desc; H1 is an on-page metric
        };

        let hostname = 'unknown';
        try { hostname = new URL(item.url).hostname; } catch (e) {}

        // 10X Math: 4 metrics = 25% each
        const score = Object.values(metrics).filter(Boolean).length * 25;
        return { domain: hostname, url: item.url, score, metrics };
      });

    return { analysis, cost: data.tasks?.[0]?.cost || 0 };
  } catch (_e) { return { analysis: [], cost: 0 }; }
}