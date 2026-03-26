'use server'

import { getRequestContext } from '@cloudflare/next-on-pages';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function saveCredentials(formData: FormData) {
  const login = formData.get('login');
  const password = formData.get('password');

  if (!login || !password || typeof login !== 'string' || typeof password !== 'string') {
    throw new Error('Login and password are required');
  }

  // Get the authenticated user's email from Cloudflare Access
  const headersList = await headers();
  const userEmail = headersList.get('Cf-Access-Authenticated-User-Email');

  if (!userEmail) {
    throw new Error('Unauthorized: No Cloudflare Access email found');
  }

  // Encode credentials for DataForSEO Basic Auth
  const credentials = btoa(`${login}:${password}`);
  const credentialsKey = `${userEmail}:settings:credentials`;

  // Get the KV binding
  const { env } = getRequestContext();
  
  // Save to KV indefinitely (no expirationTtl)
  await env.dfsui.put(credentialsKey, credentials);

  // Tell Next.js to purge the cache for the dashboard so it re-renders 
  // without the onboarding form and fetches the actual API balance
  revalidatePath('/dashboard');
}