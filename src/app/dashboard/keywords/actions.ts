'use server'

import { getRequestContext } from '@cloudflare/next-on-pages';
import { getTeamContext, CloudflareEnv } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function fetchKeywords(keyword: string, location: string, mode: 'labs' | 'live') {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { dfsUser, dfsPass } = await getTeamContext(env);
  
  if (!dfsUser || !dfsPass) {
    return { results: [], cost: 0, error: "API Credentials missing. Check Settings." };
  }

  const auth = btoa(`${dfsUser}:${dfsPass}`);
  const endpoint = mode === 'labs'
    ? 'https://api.dataforseo.com/v3/dataforseo_labs/google/related_keywords/live'
    : 'https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live';

  // 10X Payload Logic
  const payload = mode === 'labs' 
    ? [{ keyword, location_code: parseInt(location), language_code: 1000, limit: 20 }]
    : [{ keywords: [keyword], location_code: parseInt(location), language_code: 1000, include_seed_keyword: true }];

  try {
    console.log(`DFS Request [${mode}]:`, JSON.stringify(payload));

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${auth}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`DFS HTTP Error ${res.status}:`, text);
      return { results: [], cost: 0, error: `API Server Error (${res.status})` };
    }

    const data = await res.json() as any;
    const task = data.tasks?.[0];

    // Check for DataForSEO internal status codes (e.g. 40201 = No Balance)
    if (task && task.status_code >= 40000) {
      console.error("DFS Business Error:", task.status_code, task.status_message);
      return { results: [], cost: 0, error: task.status_message };
    }

    const results = task?.result?.[0]?.items || [];
    console.log(`DFS Success: Found ${results.length} items. Cost: ${task?.cost}`);

    revalidatePath('/dashboard/keywords'); 
    return { results, cost: task?.cost || 0 };

  } catch (error: any) {
    console.error("Fetch keywords exception:", error.message);
    return { results: [], cost: 0, error: "Connection to API failed." };
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

export async function analyzeCompetition(keyword: string, locationCode: string) {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { dfsUser, dfsPass } = await getTeamContext(env);
  const auth = btoa(`${dfsUser}:${dfsPass}`);

  try {
    const res = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/regular', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([{ keyword, location_code: parseInt(locationCode), language_code: 1000, limit: 10 }])
    });

    const data = await res.json() as any;
    const items = data.tasks?.[0]?.result?.[0]?.items || [];

    const analysis = items.slice(0, 10).map((item: any) => {
      const kw = keyword.toLowerCase();
      const metrics = {
        url: item.url.toLowerCase().includes(kw.replace(/\s+/g, '-')),
        title: (item.title || "").toLowerCase().includes(kw),
        description: (item.description || "").toLowerCase().includes(kw),
        h1: false, p1: false
      };
      return { domain: new URL(item.url).hostname, url: item.url, score: Object.values(metrics).filter(Boolean).length * 25, metrics };
    });

    return { analysis, cost: data.tasks?.[0]?.cost || 0 };
  } catch (_e) { return { analysis: [], cost: 0 }; }
}