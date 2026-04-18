'use server'

import { getRequestContext } from '@cloudflare/next-on-pages';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getTeamContext, CloudflareEnv, getIdentity } from '@/lib/auth';

/**
 * Creates a new workspace/team for the current user.
 */
export async function createTeam(formData: FormData) {
  const name = formData.get('teamName') as string;
  const { env } = getRequestContext() as { env: CloudflareEnv };
  
  // env is required here to resolve identity correctly in Production
  const email = await getIdentity(env);

  if (!name || email === 'user') return;

  const teamId = `team-${crypto.randomUUID().slice(0, 8)}`;
  
  // 1. Set Team Metadata
  await env.dfsui.put(`team:${teamId}:name`, name);
  await env.dfsui.put(`team:${teamId}:members`, JSON.stringify([email]));
  
  // 2. Add this team to the user's list of joined teams
  const teamsRaw = await env.dfsui.get(`user:${email}:teams`);
  const teams = teamsRaw ? (JSON.parse(teamsRaw) as string[]) : [email];
  if (!teams.includes(teamId)) teams.push(teamId);
  await env.dfsui.put(`user:${email}:teams`, JSON.stringify(teams));

  // 3. Set this new team as the active one
  await env.dfsui.put(`user:${email}:active-team`, teamId);
  
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/settings');
}

/**
 * Adds a new member to the current active workspace.
 */
export async function addMember(formData: FormData) {
  const inviteEmail = (formData.get('email') as string).toLowerCase().trim();
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { activeTeam, members } = await getTeamContext(env);

  // Security: Only the owner can invite, and user shouldn't be added twice
  if (!activeTeam.isOwner || members.includes(inviteEmail) || !inviteEmail) return;

  // 1. Update Team member list
  const newMembers = [...members, inviteEmail];
  await env.dfsui.put(`team:${activeTeam.id}:members`, JSON.stringify(newMembers));
  
  // 2. Add the team to the invitee's list of teams
  const inviteeTeamsRaw = await env.dfsui.get(`user:${inviteEmail}:teams`);
  const inviteeTeams = inviteeTeamsRaw ? (JSON.parse(inviteeTeamsRaw) as string[]) : [inviteEmail];
  if (!inviteeTeams.includes(activeTeam.id)) inviteeTeams.push(activeTeam.id);
  await env.dfsui.put(`user:${inviteEmail}:teams`, JSON.stringify(inviteeTeams));

  revalidatePath('/dashboard/settings');
}

/**
 * Switches the user's currently active team context.
 */
export async function switchTeam(teamId: string) {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const email = await getIdentity(env);
  
  await env.dfsui.put(`user:${email}:active-team`, teamId);
  
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/settings');
}

/**
 * Permanently deletes the active workspace.
 */
export async function deleteTeam() {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { email, activeTeam, members } = await getTeamContext(env);

  // Security: Only owner can delete, and only if they are the last member
  if (!activeTeam.isOwner || members.length > 1) {
    console.error("Deletion blocked: Only owners can delete empty workspaces.");
    return;
  }

  // 1. Remove team data
  await env.dfsui.delete(`team:${activeTeam.id}:name`);
  await env.dfsui.delete(`team:${activeTeam.id}:members`);
  await env.dfsui.delete(`team:${activeTeam.id}:dfs-user`);
  await env.dfsui.delete(`team:${activeTeam.id}:dfs-pass`);
  
  // 2. Remove from user's active list
  const teamsRaw = await env.dfsui.get(`user:${email}:teams`);
  const teams = teamsRaw ? (JSON.parse(teamsRaw) as string[]).filter(id => id !== activeTeam.id) : [];
  await env.dfsui.put(`user:${email}:teams`, JSON.stringify(teams));

  // 3. Revert user to their personal workspace
  await env.dfsui.put(`user:${email}:active-team`, email);

  revalidatePath('/dashboard');
  redirect('/dashboard/settings');
}

/**
 * Updates DataForSEO credentials for the active workspace.
 */
export async function updateSettings(formData: FormData) {
  const user = formData.get('login') as string;
  const pass = formData.get('password') as string;
  const { env } = getRequestContext() as { env: CloudflareEnv };
  
  const { activeTeam } = await getTeamContext(env);
  
  // Security Lock: Only owner can modify workspace credentials
  if (!activeTeam.isOwner || !user || !pass) {
    console.error("Unauthorized attempt to update credentials");
    return;
  }
  
  await env.dfsui.put(`team:${activeTeam.id}:dfs-user`, user);
  await env.dfsui.put(`team:${activeTeam.id}:dfs-pass`, pass);
  
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/settings');
}
/**
 * Manage Global Administrators
 */
export async function addAdmin(adminEmail: string) {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { isAdmin } = await getTeamContext(env);
  if (!isAdmin) throw new Error("Unauthorized");

  const targetEmail = adminEmail.toLowerCase().trim();
  const raw = await env.dfsui.get('app:admin');
  const admins: string[] = raw ? JSON.parse(raw) : [];
  
  if (!admins.includes(targetEmail)) {
    admins.push(targetEmail);
    await env.dfsui.put('app:admin', JSON.stringify(admins));
  }
  revalidatePath('/dashboard/settings');
}

export async function removeAdmin(adminEmail: string) {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { isAdmin, email } = await getTeamContext(env);
  
  // Prevent removing yourself to avoid total lockout
  if (!isAdmin || email === adminEmail) throw new Error("Unauthorized or self-removal blocked");

  const raw = await env.dfsui.get('app:admin');
  let admins: string[] = raw ? JSON.parse(raw) : [];
  
  admins = admins.filter(e => e !== adminEmail);
  await env.dfsui.put('app:admin', JSON.stringify(admins));
  revalidatePath('/dashboard/settings');
}

export async function getAdminList() {
  const { env } = getRequestContext() as { env: CloudflareEnv };
  const { isAdmin } = await getTeamContext(env);
  if (!isAdmin) return [];

  const raw = await env.dfsui.get('app:admin');
  return raw ? (JSON.parse(raw) as string[]) : [];
}
