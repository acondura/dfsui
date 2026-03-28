// src/lib/auth.ts
import { headers } from 'next/headers';

export interface CloudflareEnv {
  dfsui: KVNamespace;
}

export interface DFUserResponse {
  tasks?: Array<{
    result?: Array<{
      money?: { balance?: number; };
    }>;
  }>;
}

export async function getIdentity(): Promise<string> {
  const headersList = await headers();
  const headerEmail = headersList.get('cf-access-authenticated-user-email') || 
                      headersList.get('Cf-Access-Authenticated-User-Email');
  if (headerEmail) return headerEmail.toLowerCase();

  const jwt = headersList.get('cf-access-jwt-assertion');
  if (jwt) {
    try {
      const payload = jwt.split('.')[1];
      const decoded = JSON.parse(globalThis.atob(payload));
      return decoded.email?.toLowerCase() || 'user';
    } catch (e) { return 'user'; }
  }
  return 'user';
}

export async function getTeamContext(env: CloudflareEnv) {
  const email = await getIdentity();
  
  // 1. Get current active team or fallback to personal
  const teamId = await env.dfsui.get(`user:${email}:active-team`) || email;

  // 2. Get team metadata
  const [dfsUser, dfsPass, membersRaw, teamName] = await Promise.all([
    env.dfsui.get(`team:${teamId}:dfs-user`),
    env.dfsui.get(`team:${teamId}:dfs-pass`),
    env.dfsui.get(`team:${teamId}:members`),
    env.dfsui.get(`team:${teamId}:name`)
  ]);

  const members = membersRaw ? JSON.parse(membersRaw) as string[] : [teamId];

  return {
    email,
    teamId,
    teamName: teamName || (teamId === email ? 'Personal Workspace' : teamId),
    dfsUser,
    dfsPass,
    members,
    isConnected: !!(dfsUser && dfsPass),
    isOwner: teamId === email || members[0] === email
  };
}