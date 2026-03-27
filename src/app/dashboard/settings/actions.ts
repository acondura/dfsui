'use server'

import { getRequestContext } from '@cloudflare/next-on-pages';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteCredentials() {
  const headersList = await headers();
  const userEmail = headersList.get('Cf-Access-Authenticated-User-Email');

  if (!userEmail) throw new Error('Unauthorized');

  const { env } = getRequestContext();
  const credentialsKey = `${userEmail}:settings:credentials`;

  // Wipe the keys from KV
  await env.dfsui.delete(credentialsKey);

  // Clear all cached API responses for this user to ensure privacy
  // In a production app, you'd iterate through keys with the email prefix, 
  // but for now, we'll just force a dashboard refresh.
  
  revalidatePath('/dashboard');
  redirect('/dashboard');
}