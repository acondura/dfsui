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

export async function fetchKeywords(
  keyword: string, 
  location: string, 
  apiType: 'labs' | 'live', 
  labsFunction: 'keyword_suggestions' | 'keyword_ideas' = 'keyword_suggestions',
  engine: string = 'google',
  language: string = 'English',
  bypassCache = false
) {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const email = await getIdentity(env);
  const locCode = parseInt(location) || 2840;
  
  // Use a new cache version for the expanded parameters
  const kvKey = `keywords_v3:${email}:${apiType}:${engine}:${labsFunction}:${locCode}:${language.replace(/\s+/g, '_')}:${keyword.replace(/\s+/g, '_')}`;

  if (!bypassCache) {
    const cached = await env.dfsui.get(kvKey);
    if (cached) {
      console.log(`[KV Cache Hit] Keywords: ${keyword} (${apiType}/${engine})`);
      return { results: JSON.parse(cached), cost: 0 };
    }
  }

  const { dfsUser, dfsPass } = await getTeamContext(env);
  if (!dfsUser || !dfsPass) return { results: [], cost: 0, error: "Credentials missing." };

  const auth = btoa(`${dfsUser}:${dfsPass}`);
  
  let endpoint = '';
  let payload: any[] = [];

  if (apiType === 'labs') {
    endpoint = `https://api.dataforseo.com/v3/dataforseo_labs/${engine}/${labsFunction}/live`;
    if (labsFunction === 'keyword_suggestions') {
        payload = [{ keyword, location_code: locCode, language_name: language, limit: 1000 }];
    } else {
        payload = [{ keywords: [keyword], location_code: locCode, language_name: language, limit: 1000 }];
    }
  } else {
    // Keywords Data API - Mapping to Google Ads as primary live source
    const subEngine = engine === 'google' ? 'google_ads' : engine;
    endpoint = `https://api.dataforseo.com/v3/keywords_data/${subEngine}/keywords_for_keywords/live`;
    payload = [{ keywords: [keyword], location_code: locCode, language_name: language, include_seed_keyword: true }];
  }

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
    
    // Normalize results format
    const results = rawItems.map((i: any) => {
      if (apiType === 'labs') {
        return {
          keyword: i.keyword || i.keyword_data?.keyword || 'Unknown',
          keyword_info: i.keyword_info || i.keyword_data?.keyword_info
        };
      }
      return i; // Keywords Data already has a similar flat structure or specific fields
    });

    if (results.length > 0) {
      await env.dfsui.put(kvKey, JSON.stringify(results), { 
        expirationTtl: 604800,
        metadata: { 
            timestamp: Date.now(),
            keyword,
            location: locCode.toString(),
            apiType,
            engine,
            labsFunction,
            language
        }
      });
      console.log(`[KV Cache Miss] Saved keywords: ${keyword} (${apiType}/${engine})`);
    }

    revalidatePath('/dashboard/keywords'); 
    return { results, cost: task?.cost || 0 };
  } catch (_e) { return { results: [], cost: 0, error: "API Connection Failed" }; }
}

export async function fetchRecentQueries() {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const email = await getIdentity(env);
  
  try {
    const list = await env.dfsui.list({ prefix: `keywords_v3:${email}:` });
    const queries = list.keys.map(key => {
      const parts = key.name.split(':');
      const meta = key.metadata as any;
      const timestamp = meta?.timestamp || 0;
      return {
        location: meta?.location || parts[5],
        apiType: meta?.apiType || parts[2],
        engine: meta?.engine || parts[3],
        labsFunction: meta?.labsFunction || parts[4],
        language: meta?.language || parts[6],
        keyword: meta?.keyword || parts.slice(7).join(':').replace(/_/g, ' '),
        timestamp
      };
    });
    
    // Sort by timestamp descending
    return queries.sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    return [];
  }
}


export async function getApiMetadata(apiType: 'labs' | 'live') {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { dfsUser, dfsPass } = await getTeamContext(env);
  if (!dfsUser || !dfsPass) return { locations: [], languages: [] };
  
  const auth = btoa(`${dfsUser}:${dfsPass}`);
  
  if (apiType === 'labs') {
    const url = 'https://api.dataforseo.com/v3/dataforseo_labs/locations_and_languages';
    try {
      const res = await fetch(url, { headers: { 'Authorization': `Basic ${auth}` } });
      const data = await res.json() as any;
      const results = data.tasks?.[0]?.result || [];
      
      const locations = results.map((r: any) => ({
        label: r.location_name,
        value: r.location_code?.toString()
      }));

      // Extract all unique languages from all locations
      const langMap = new Map();
      results.forEach((r: any) => {
        r.available_languages?.forEach((l: any) => {
          langMap.set(l.language_name, l.language_name);
        });
      });
      
      const languages = Array.from(langMap.values()).map(l => ({ label: l.toUpperCase(), value: l }));

      return { locations, languages };
    } catch (_e) { return { locations: [], languages: [] }; }
  } else {
    // Live (Google Ads)
    const locUrl = 'https://api.dataforseo.com/v3/keywords_data/google_ads/locations';
    const langUrl = 'https://api.dataforseo.com/v3/keywords_data/google_ads/languages';
    
    try {
      const [locRes, langRes] = await Promise.all([
        fetch(locUrl, { headers: { 'Authorization': `Basic ${auth}` } }),
        fetch(langUrl, { headers: { 'Authorization': `Basic ${auth}` } })
      ]);
      
      const locData = await locRes.json() as any;
      const langData = await langRes.json() as any;
      
      const locations = (locData.tasks?.[0]?.result || []).map((r: any) => ({
        label: r.location_name,
        value: r.location_code?.toString()
      }));
      
      const languages = (langData.tasks?.[0]?.result || []).map((r: any) => ({
        label: r.language_name.toUpperCase(),
        value: r.language_name
      }));
      
      return { locations, languages };
    } catch (_e) { return { locations: [], languages: [] }; }
  }
}

export async function getSerpPrice() {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { dfsUser, dfsPass } = await getTeamContext(env);
  if (!dfsUser || !dfsPass) return 0.05;
  
  const auth = btoa(`${dfsUser}:${dfsPass}`);
  try {
    const res = await fetch('https://api.dataforseo.com/v3/appendix/user_data', { headers: { 'Authorization': `Basic ${auth}` } });
    const data = await res.json() as any;
    const price = data.tasks?.[0]?.result?.[0]?.price?.serp?.google?.organic?.live?.priority_normal?.cost || 0.05;
    return price;
  } catch (e) { return 0.05; }
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
        const words = keyword.toLowerCase().split(/\s+/).filter(w => w.length > 1);
        
        const checkMatch = (text: string, isUrl = false) => {
          if (!text) return false;
          const target = text.toLowerCase();
          if (isUrl) {
            // For URLs, we also want to match if words are separated by hyphens or underscores
            return words.every(word => target.includes(word));
          }
          return words.every(word => target.includes(word));
        };

        const metrics = {
          url: checkMatch(item.url, true),
          title: checkMatch(item.title),
          description: checkMatch(item.description),
          h1: false 
        };
        
        let hostname = 'unknown';
        try { hostname = new URL(item.url).hostname; } catch (e) {}
        
        // Calculate score based on metrics
        const score = Object.values(metrics).filter(Boolean).length * 25;
        
        return { domain: hostname, url: item.url, score, metrics };
      });

    // 3. Save to KV for next time (expires in 7 days)
    if (analysis.length > 0) {
      await env.dfsui.put(kvKey, JSON.stringify(analysis), { expirationTtl: 604800 });
      console.log(`[KV Cache Miss] Saved ${keyword}`);
    }

    return { analysis, cost: data.tasks?.[0]?.cost || 0, cached: false };
  } catch (_e) { return { analysis: [], cost: 0, cached: false }; }
}