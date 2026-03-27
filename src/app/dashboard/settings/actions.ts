// src/app/dashboard/settings/actions.ts
'use server'

import { getRequestContext } from '@cloudflare/next-on-pages';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateSettings(formData: FormData) {
  const user = formData.get('login') as string;
  const pass = formData.get('password') as string;
  
  const headersList = await headers();
  const email = headersList.get('Cf-Access-Authenticated-User-Email');
  if (!email || !user || !pass) return;

  const { env } = getRequestContext();
  
  await env.dfsui.put(`${email}:credentials:dfs-user`, user);
  await env.dfsui.put(`${email}:credentials:dfs-pass`, pass);
  
  revalidatePath('/dashboard/settings');
}

export async function deleteCredentials() {
  const headersList = await headers();
  const email = headersList.get('Cf-Access-Authenticated-User-Email');
  if (!email) throw new Error('Unauthorized');

  const { env } = getRequestContext();

  // Wipe the granular keys
  await env.dfsui.delete(`${email}:credentials:dfs-user`);
  await env.dfsui.delete(`${email}:credentials:dfs-pass`);

  revalidatePath('/dashboard');
  redirect('/dashboard/settings');
}