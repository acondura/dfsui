// src/app/dashboard/settings/actions.ts
'use server'

import { getRequestContext } from '@cloudflare/next-on-pages';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getTeamContext, CloudflareEnv, getIdentity } from '@/lib/auth';

export async function createTeam(formData: FormData) {
  const name = formData.get('teamName') as string;
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const email = await getIdentity();

  if (!name || email === 'user') return;

  const teamId = `team-${crypto.randomUUID()}`;
  
  // 1. Set up team metadata
  await env.dfsui.put(`team:${teamId}:name`, name);
  await env.dfsui.put(`team:${teamId}:members`, JSON.stringify([email]));
  
  // 2. Set as active for the creator
  await env.dfsui.put(`user:${email}:active-team`, teamId);
  
  revalidatePath('/dashboard/settings');
}

export async function addMember(formData: FormData) {
  const inviteEmail = (formData.get('email') as string).toLowerCase();
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { teamId, members, isOwner } = await getTeamContext(env);

  if (!isOwner || members.includes(inviteEmail)) return;

  const newMembers = [...members, inviteEmail];
  await env.dfsui.put(`team:${teamId}:members`, JSON.stringify(newMembers));
  
  revalidatePath('/dashboard/settings');
}

export async function deleteTeam() {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { email, teamId, members, isOwner } = await getTeamContext(env);

  // Requirement: Only delete if no other members exist
  if (!isOwner || members.length > 1) return;

  // Clean up all team data
  await env.dfsui.delete(`team:${teamId}:name`);
  await env.dfsui.delete(`team:${teamId}:members`);
  await env.dfsui.delete(`team:${teamId}:dfs-user`);
  await env.dfsui.delete(`team:${teamId}:dfs-pass`);
  
  // Reset user to personal workspace
  await env.dfsui.delete(`user:${email}:active-team`);

  revalidatePath('/dashboard');
  redirect('/dashboard/settings');
}

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
  const { email, teamId, isPersonal } = await getTeamContext(env);

  if (isPersonal) {
    await env.dfsui.delete(`team:${teamId}:dfs-user`);
    await env.dfsui.delete(`team:${teamId}:dfs-pass`);
  } else {
    // Shared Team: Only disconnect the user from the workspace
    await env.dfsui.delete(`user:${email}:active-team`);
  }

  revalidatePath('/dashboard');
  redirect('/dashboard/settings');
}