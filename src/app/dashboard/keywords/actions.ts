'use server'

import { getRequestContext } from '@cloudflare/next-on-pages';
import { getTeamContext, CloudflareEnv } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

interface DFSLocation {
  location_code: number;
  location_name: string;
  location_type?: string;
}

interface DFSTask<T> {
  cost: number;
  result: T[];
}

interface DFSResponse<T> {
  tasks: DFSTask<T>[];
}

export interface KeywordItem {
  keyword: string;
  keyword_info?: {
    search_volume?: number;
    cpc?: number;
  };
  [key: string]: unknown;
}

interface SerpItem {
  url: string;
  title?: string;
  description?: string;
  [key: string]: unknown;
}

export async function getLocations(type: 'labs' | 'live' = 'labs'): Promise<DFSLocation[]> {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { dfsUser, dfsPass } = await getTeamContext(env);
  const cacheKey = `cache:locations:${type}`;
  
  const cached = await env.dfsui.get(cacheKey);
  if (cached) return JSON.parse(cached) as DFSLocation[];

  const auth = btoa(`${dfsUser}:${dfsPass}`);
  const url = type === 'labs' 
    ? 'https://api.dataforseo.com/v3/dataforseo_labs/locations_and_languages'
    : 'https://api.dataforseo.com/v3/keywords_data/google_ads/locations';

  try {
    const res = await fetch(url, { headers: { 'Authorization': `Basic ${auth}` } });
    const data = await res.json() as DFSResponse<DFSLocation>;
    const results = data.tasks?.[0]?.result || [];
    const filtered = results.filter((loc) => loc.location_type === 'Country' || !loc.location_type);
    
    await env.dfsui.put(cacheKey, JSON.stringify(filtered), { expirationTtl: 86400 });
    return filtered;
  } catch (_e) {
    return [];
  }
}

export async function fetchKeywords(keyword: string, location: string, mode: 'labs' | 'live') {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { dfsUser, dfsPass } = await getTeamContext(env);
  const auth = btoa(`${dfsUser}:${dfsPass}`);
  const languageCode = 1000; // Defaulting to English

  const endpoint = mode === 'labs'
    ? 'https://api.dataforseo.com/v3/dataforseo_labs/google/related_keywords/live'
    : 'https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live';

  const payload = mode === 'labs' 
    ? [{ keyword, location_code: parseInt(location), language_code: languageCode, limit: 20 }]
    : [{ keywords: [keyword], location_code: parseInt(location), language_code: languageCode, include_seed_keyword: true }];

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json() as DFSResponse<{ items: KeywordItem[] }>;
    const task = data.tasks?.[0];
    const results = task?.result?.[0]?.items || [];
    
    revalidatePath('/dashboard'); 
    return { results, cost: task?.cost || 0 };
  } catch (_e) {
    return { results: [], cost: 0 };
  }
}

export async function analyzeCompetition(keyword: string, locationCode: string) {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { dfsUser, dfsPass } = await getTeamContext(env);
  const auth = btoa(`${dfsUser}:${dfsPass}`);

  try {
    const serpRes = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/regular', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([{ keyword, location_code: parseInt(locationCode), language_code: 1000, limit: 10 }])
    });

    const serpData = await serpRes.json() as DFSResponse<{ items: SerpItem[] }>;
    const task = serpData.tasks?.[0];
    const items = task?.result?.[0]?.items || [];

    const analysis = await Promise.all(items.slice(0, 10).map(async (item) => {
      const kw = keyword.toLowerCase();
      const url = item.url.toLowerCase();
      const title = (item.title || "").toLowerCase();
      const desc = (item.description || "").toLowerCase();

      const metrics = {
        url: url.includes(kw.replace(/\s+/g, '-')),
        title: title.includes(kw),
        description: desc.includes(kw),
        h1: false,
        p1: false
      };

      try {
        const page = await fetch(item.url, { signal: AbortSignal.timeout(3000) });
        const html = await page.text();
        metrics.h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.toLowerCase().includes(kw) || false;
        metrics.p1 = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1]?.toLowerCase().includes(kw) || false;
      } catch (_e) { }

      const score = Object.values(metrics).filter(Boolean).length * 20;
      return { domain: new URL(item.url).hostname, url: item.url, score, metrics };
    }));

    revalidatePath('/dashboard');
    return { analysis, cost: task?.cost || 0 };
  } catch (_e) {
    return { analysis: [], cost: 0 };
  }
}