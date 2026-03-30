// src/lib/auth.ts
import { headers } from 'next/headers';
import { importJWK, jwtVerify } from 'jose';

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

interface JWKSResponse {
  keys: Array<{
    kty: string;
    kid: string;
    use?: string;
    alg?: string;
    n?: string;
    e?: string;
    [key: string]: unknown; 
  }>;
}

/**
 * Validates the Cloudflare Access JWT using the environment domain.
 */
async function verifyAccessJwt(jwt: string, env: CloudflareEnv): Promise<string | null> {
  // Access variable from Cloudflare env bindings (Prod) or process.env (Dev)
  const teamDomain = env.NEXT_PUBLIC_CF_TEAM_DOMAIN || process.env.NEXT_PUBLIC_CF_TEAM_DOMAIN;
  
  if (!teamDomain) {
    console.error("Missing NEXT_PUBLIC_CF_TEAM_DOMAIN in environment");
    return null;
  }

  try {
    const certsUrl = `https://${teamDomain}.cloudflareaccess.com/cdn-cgi/access/jwks`;
    const response = await fetch(certsUrl);
    const { keys } = (await response.json()) as JWKSResponse;
    
    if (!keys || keys.length === 0) return null;
    
    const jwk = keys[0]; 
    const publicKey = await importJWK(jwk, 'RS256');
    
    const { payload } = await jwtVerify(jwt, publicKey, {
      issuer: `https://${teamDomain}.cloudflareaccess.com`,
    });

    return (payload.email as string)?.toLowerCase() || null;
  } catch (e) {
    console.error("JWT Verification Failed:", e);
    return null;
  }
}

/**
 * Extracts and verifies the user's identity.
 */
export async function getIdentity(env: CloudflareEnv): Promise<string> {
  const headersList = await headers();
  const jwt = headersList.get('cf-access-jwt-assertion');

  if (jwt) {
    const verifiedEmail = await verifyAccessJwt(jwt, env);
    if (verifiedEmail) return verifiedEmail;
  }

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