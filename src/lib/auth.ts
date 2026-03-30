// src/lib/auth.ts
import { headers } from 'next/headers';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export interface CloudflareEnv {
  dfsui: KVNamespace;
  NEXT_PUBLIC_CF_TEAM_DOMAIN?: string;
}

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
 * Robustly validates the Cloudflare Access JWT.
 * createRemoteJWKSet handles fetching and caching the keys automatically.
 */
async function verifyAccessJwt(jwt: string, env: CloudflareEnv): Promise<string | null> {
  // Use the env binding (Prod) or process.env (Dev fallback)
  const teamDomain = (env.NEXT_PUBLIC_CF_TEAM_DOMAIN || process.env.NEXT_PUBLIC_CF_TEAM_DOMAIN || '').trim();
  
  if (!teamDomain) {
    console.error("Auth Error: NEXT_PUBLIC_CF_TEAM_DOMAIN is not set in environment variables.");
    return null;
  }

  try {
    const jwksUrl = `https://${teamDomain}.cloudflareaccess.com/cdn-cgi/access/jwks`;
    
    // jose manages the fetch and internal caching of the JWKS
    const JWKS = createRemoteJWKSet(new URL(jwksUrl));
    
    const { payload } = await jwtVerify(jwt, JWKS, {
      issuer: `https://${teamDomain}.cloudflareaccess.com`,
    });

    return (payload.email as string)?.toLowerCase() || null;
  } catch (e) {
    // This catches signature mismatches, expired tokens, or network issues
    console.error("JWT Verification Failed:", e instanceof Error ? e.message : e);
    return null;
  }
}

/**
 * Extracts and verifies identity. Now requires 'env' to be passed.
 */
export async function getIdentity(env: CloudflareEnv): Promise<string> {
  const headersList = await headers();
  const jwt = headersList.get('cf-access-jwt-assertion');

  if (jwt) {
    const verifiedEmail = await verifyAccessJwt(jwt, env);
    if (verifiedEmail) return verifiedEmail;
  }

  // Final fallback to headers (Useful for development/tunnels)
  const headerEmail = headersList.get('cf-access-authenticated-user-email') || 
                      headersList.get('Cf-Access-Authenticated-User-Email');
  
  return headerEmail?.toLowerCase() || 'user';
}

/**
 * Resolves the full context for the current user and their active team.
 */
export async function getTeamContext(env: CloudflareEnv) {
  const email = await getIdentity(env);
  const activeTeamId = await env.dfsui.get(`user:${email}:active-team`) || email;

  const teamsRaw = await env.dfsui.get(`user:${email}:teams`);
  const teamIds = teamsRaw ? (JSON.parse(teamsRaw) as string[]) : [];
  
  if (!teamIds.includes(email)) teamIds.push(email);

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