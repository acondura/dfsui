// src/lib/auth.ts
import { headers } from 'next/headers';

export interface CloudflareEnv {
  dfsui: KVNamespace;
}

// CRITICAL: This must be exported so page.tsx can see it
export interface DFUserResponse {
  tasks?: Array<{
    result?: Array<{
      money?: { balance?: number; };
    }>;
  }>;
}

export interface Team {
  id: string;
  name: string;
  isOwner: boolean;
}

/**
 * Extracts the user's email from Cloudflare headers or JWT
 */
export async function getIdentity(): Promise<string> {
  const headersList = await headers();
  const headerEmail = headersList.get('cf-access-authenticated-user-email') || 
                      headersList.get('Cf-Access-Authenticated-User-Email');
  
  if (headerEmail) return headerEmail.toLowerCase();

  const jwt = headersList.get('cf-access-jwt-assertion');
  if (jwt) {
    try {
      const payload = jwt.split('.')[1];
      // Use globalThis.atob for environment compatibility
      const decoded = JSON.parse(globalThis.atob(payload));
      return decoded.email?.toLowerCase() || 'user';
    } catch (e) { return 'user'; }
  }
  return 'user';
}

/**
 * Resolves the full context for the current user and their active team
 */
export async function getTeamContext(env: CloudflareEnv) {
  const email = await getIdentity();
  
  // 1. Get user's active team ID
  const activeTeamId = await env.dfsui.get(`user:${email}:active-team`) || email;

  // 2. Fetch all teams this user belongs to
  const teamsRaw = await env.dfsui.get(`user:${email}:teams`);
  const teamIds = teamsRaw ? (JSON.parse(teamsRaw) as string[]) : [];
  
  if (!teamIds.includes(email)) teamIds.push(email);

  // 3. Resolve metadata for all teams
  const allTeams = await Promise.all(teamIds.map(async (id) => {
    const name = await env.dfsui.get(`team:${id}:name`);
    const membersRaw = await env.dfsui.get(`team:${id}:members`);
    const members = membersRaw ? (JSON.parse(membersRaw) as string[]) : [id];
    return {
      id,
      name: name || (id === email ? 'Personal Workspace' : id.split('-')[0]),
      isOwner: id === email || members[0] === email
    };
  }));

  const activeTeam = allTeams.find(t => t.id === activeTeamId) || allTeams[0];
  const dfsUser = await env.dfsui.get(`team:${activeTeam.id}:dfs-user`);
  const dfsPass = await env.dfsui.get(`team:${activeTeam.id}:dfs-pass`);
  const membersRaw = await env.dfsui.get(`team:${activeTeam.id}:members`);
  const members = membersRaw ? (JSON.parse(membersRaw) as string[]) : [activeTeam.id];

  return {
    email,
    activeTeam,
    allTeams,
    dfsUser,
    dfsPass,
    members,
    isConnected: !!(dfsUser && dfsPass),
    isPersonal: activeTeam.id === email
  };
}