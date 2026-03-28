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

  const teamId = `team-${crypto.randomUUID().slice(0, 8)}`;
  
  // Set metadata
  await env.dfsui.put(`team:${teamId}:name`, name);
  await env.dfsui.put(`team:${teamId}:members`, JSON.stringify([email]));
  
  // Add to user's team list
  const teamsRaw = await env.dfsui.get(`user:${email}:teams`);
  const teams = teamsRaw ? JSON.parse(teamsRaw) : [email];
  if (!teams.includes(teamId)) teams.push(teamId);
  await env.dfsui.put(`user:${email}:teams`, JSON.stringify(teams));

  // Set as active
  await env.dfsui.put(`user:${email}:active-team`, teamId);
  
  revalidatePath('/dashboard');
}

export async function addMember(formData: FormData) {
  const inviteEmail = (formData.get('email') as string).toLowerCase();
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { activeTeam, members } = await getTeamContext(env);

  if (!activeTeam.isOwner || members.includes(inviteEmail)) return;

  // Add to Team members
  const newMembers = [...members, inviteEmail];
  await env.dfsui.put(`team:${activeTeam.id}:members`, JSON.stringify(newMembers));
  
  // Add team to invitee's teams list
  const inviteeTeamsRaw = await env.dfsui.get(`user:${inviteEmail}:teams`);
  const inviteeTeams = inviteeTeamsRaw ? JSON.parse(inviteeTeamsRaw) : [inviteEmail];
  if (!inviteeTeams.includes(activeTeam.id)) inviteeTeams.push(activeTeam.id);
  await env.dfsui.put(`user:${inviteEmail}:teams`, JSON.stringify(inviteeTeams));

  revalidatePath('/dashboard/settings');
}

export async function switchTeam(teamId: string) {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const email = await getIdentity();
  await env.dfsui.put(`user:${email}:active-team`, teamId);
  revalidatePath('/dashboard');
}

export async function deleteTeam() {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { email, activeTeam, members } = await getTeamContext(env);

  if (!activeTeam.isOwner || members.length > 1) return;

  // Cleanup
  await env.dfsui.delete(`team:${activeTeam.id}:name`);
  await env.dfsui.delete(`team:${activeTeam.id}:members`);
  await env.dfsui.delete(`team:${activeTeam.id}:dfs-user`);
  await env.dfsui.delete(`team:${activeTeam.id}:dfs-pass`);
  
  // Remove from user's list
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
  
  await env.dfsui.put(`team:${activeTeam.id}:dfs-user`, user);
  await env.dfsui.put(`team:${activeTeam.id}:dfs-pass`, pass);
  revalidatePath('/dashboard');
}