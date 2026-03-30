// src/app/dashboard/settings/actions.ts
'use server'

import { getRequestContext } from '@cloudflare/next-on-pages';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getTeamContext, CloudflareEnv, getIdentity } from '@/lib/auth';

export async function createTeam(formData: FormData) {
  const name = formData.get('teamName') as string;
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const email = await getIdentity(env); // Added env argument

  if (!name || email === 'user') return;

  const teamId = `team-${crypto.randomUUID().slice(0, 8)}`;
  
  await env.dfsui.put(`team:${teamId}:name`, name);
  await env.dfsui.put(`team:${teamId}:members`, JSON.stringify([email]));
  
  const teamsRaw = await env.dfsui.get(`user:${email}:teams`);
  const teams = teamsRaw ? JSON.parse(teamsRaw) : [email];
  if (!teams.includes(teamId)) teams.push(teamId);
  await env.dfsui.put(`user:${email}:teams`, JSON.stringify(teams));

  await env.dfsui.put(`user:${email}:active-team`, teamId);
  
  revalidatePath('/dashboard');
}

export async function addMember(formData: FormData) {
  const inviteEmail = (formData.get('email') as string).toLowerCase();
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { activeTeam, members } = await getTeamContext(env);

  if (!activeTeam.isOwner || members.includes(inviteEmail)) return;

  const newMembers = [...members, inviteEmail];
  await env.dfsui.put(`team:${activeTeam.id}:members`, JSON.stringify(newMembers));
  
  const inviteeTeamsRaw = await env.dfsui.get(`user:${inviteEmail}:teams`);
  const inviteeTeams = inviteeTeamsRaw ? JSON.parse(inviteeTeamsRaw) : [inviteEmail];
  if (!inviteeTeams.includes(activeTeam.id)) inviteeTeams.push(activeTeam.id);
  await env.dfsui.put(`user:${inviteEmail}:teams`, JSON.stringify(inviteeTeams));

  revalidatePath('/dashboard/settings');
}

export async function switchTeam(teamId: string) {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const email = await getIdentity(env); // Added env argument
  await env.dfsui.put(`user:${email}:active-team`, teamId);
  revalidatePath('/dashboard');
}

export async function deleteTeam() {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { email, activeTeam, members } = await getTeamContext(env);

  if (!activeTeam.isOwner || members.length > 1) return;

  await env.dfsui.delete(`team:${activeTeam.id}:name`);
  await env.dfsui.delete(`team:${activeTeam.id}:members`);
  await env.dfsui.delete(`team:${activeTeam.id}:dfs-user`);
  await env.dfsui.delete(`team:${activeTeam.id}:dfs-pass`);
  
  const teamsRaw = await env.dfsui.get(`user:${email}:teams`);
  const teams = teamsRaw ? (JSON.parse(teamsRaw) as string[]).filter(id => id !== activeTeam.id) : [];
  await env.dfsui.put(`user:${email}:teams`, JSON.stringify(teams));

  await env.dfsui.put(`user:${email}:active-team`, email);

  revalidatePath('/dashboard');
  redirect('/dashboard/settings');
}

export async function updateSettings(formData: FormData) {
  const user = formData.get('login') as string;
  const pass = formData.get('password') as string;
  const { env } = getRequestContext() as { env: CloudflareEnv };
  
  const { activeTeam } = await getTeamContext(env);
  
  if (!activeTeam.isOwner || !user || !pass) {
    console.error("Unauthorized attempt to update credentials");
    return;
  }
  
  await env.dfsui.put(`team:${activeTeam.id}:dfs-user`, user);
  await env.dfsui.put(`team:${activeTeam.id}:dfs-pass`, pass);
  
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/settings');
}