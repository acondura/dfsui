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

/**
 * Robustly extracts the user's email from Cloudflare headers or JWT
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
      const decoded = JSON.parse(globalThis.atob(payload));
      return decoded.email?.toLowerCase() || 'user';
    } catch (e) {
      return 'user';
    }
  }
  return 'user';
}

/**
 * Resolves the active team and its DataForSEO credentials
 */
export async function getTeamContext(env: CloudflareEnv) {
  const email = await getIdentity();
  
  // Resolve Team ID (Default to email if no active team is set)
  const teamId = await env.dfsui.get(`user:${email}:active-team`) || email;

  // Fetch credentials for the resolved Team
  const dfsUser = await env.dfsui.get(`team:${teamId}:dfs-user`);
  const dfsPass = await env.dfsui.get(`team:${teamId}:dfs-pass`);

  return {
    email,
    teamId,
    dfsUser,
    dfsPass,
    isConnected: !!(dfsUser && dfsPass),
    isPersonal: teamId === email
  };
}