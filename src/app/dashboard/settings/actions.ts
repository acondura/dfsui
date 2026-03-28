// src/app/dashboard/settings/actions.ts
'use server'

import { getRequestContext } from '@cloudflare/next-on-pages';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getTeamContext, CloudflareEnv } from '@/lib/auth';

export async function updateSettings(formData: FormData) {
  const user = formData.get('login') as string;
  const pass = formData.get('password') as string;
  const { env } = getRequestContext() as { env: CloudflareEnv };
  
  const { teamId } = await getTeamContext(env);
  
  if (teamId === 'user' || !user || !pass) return;

  await env.dfsui.put(`team:${teamId}:dfs-user`, user);
  await env.dfsui.put(`team:${teamId}:dfs-pass`, pass);
  
  revalidatePath('/dashboard');
}

export async function deleteCredentials() {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { teamId } = await getTeamContext(env);

  if (teamId === 'user') throw new Error('Unauthorized');

  await env.dfsui.delete(`team:${teamId}:dfs-user`);
  await env.dfsui.delete(`team:${teamId}:dfs-pass`);

  revalidatePath('/dashboard');
  redirect('/dashboard/settings');
}