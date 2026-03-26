// src/lib/dataforseo.ts
import { getRequestContext } from '@cloudflare/next-on-pages';

interface FetchOptions {
  method?: 'GET' | 'POST';
  postData?: any;
  cacheTtl?: number; // Time to live in seconds
  email: string;
  category: string;
  child: string;
}

export async function fetchWithKVCache(endpoint: string, options: FetchOptions) {
  const { 
    method = 'POST', 
    postData = null, 
    cacheTtl = 2592000, 
    email, 
    category, 
    child 
  } = options;
  
  const { env } = getRequestContext();

  if (!env.DFS_LOGIN || !env.DFS_PASSWORD) {
    throw new Error("DataForSEO credentials are missing from the environment.");
  }

  // Strictly enforcing your cache key structure: email:category:child
  const cacheKey = `${email}:${category}:${child}`;

  // Check the Cloudflare KV cache first
  const cachedResponse = await env.dfsui.get(cacheKey);
  
  if (cachedResponse) {
    return JSON.parse(cachedResponse);
  }

  // If not in cache, fetch from the DataForSEO API
  const credentials = btoa(`${env.DFS_LOGIN}:${env.DFS_PASSWORD}`);
  
  const fetchConfig: RequestInit = {
    method,
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    }
  };

  if (method === 'POST' && postData) {
    fetchConfig.body = JSON.stringify(postData);
  }

  const res = await fetch(`https://api.dataforseo.com/v3/${endpoint}`, fetchConfig);

  if (!res.ok) {
    throw new Error(`DataForSEO API failed with status ${res.status}`);
  }

  const data = await res.json();

  // Save the successful response to the KV cache
  await env.dfsui.put(cacheKey, JSON.stringify(data), { expirationTtl: cacheTtl });

  return data;
}