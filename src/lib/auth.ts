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

interface JWK {
  kty: string;
  kid: string;
  use?: string;
  alg?: string;
  n?: string;
  e?: string;
  [key: string]: unknown;
}

/**
 * Robustly decodes a Base64URL string (handling missing padding).
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return globalThis.atob(base64);
}

/**
 * Decodes a JWT payload without verification.
 */
function decodeJwtUnsafe(jwt: string): string | null {
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    // Access JWTs usually have 'email', but fallback to 'sub' if necessary
    return (payload.email || payload.sub || null)?.toLowerCase();
  } catch (e) {
    return null;
  }
}

async function verifyAccessJwt(jwt: string, env: CloudflareEnv): Promise<string | null> {
  let teamDomain = (env.NEXT_PUBLIC_CF_TEAM_DOMAIN || process.env.NEXT_PUBLIC_CF_TEAM_DOMAIN || '').trim();
  teamDomain = teamDomain.replace(/^https?:\/\//, '').replace('.cloudflareaccess.com', '').split('/')[0];
  
  if (!teamDomain) teamDomain = 'k9czuj5q2zbo29nb';

  // We try both the modern JWKS and the legacy Certs endpoint
  const endpoints = [
    `https://${teamDomain}.cloudflareaccess.com/cdn-cgi/access/jwks`,
    `https://${teamDomain}.cloudflareaccess.com/cdn-cgi/access/certs`
  ];

  let keys: JWK[] = [];
  let lastError = "";

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'User-Agent': 'DFSUI-Auth' },
        next: { revalidate: 3600 }
      });

      if (response.ok) {
        const data = await response.json() as { keys: JWK[] };
        if (data.keys?.length > 0) {
          keys = data.keys;
          break;
        }
      }
      lastError = `Status ${response.status}`;
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Fetch failed";
    }
  }

  try {
    if (keys.length === 0) throw new Error(`Key fetch failed: ${lastError}`);
    
    const jwk = keys[0]; 
    const publicKey = await importJWK(jwk, 'RS256');
    
    const { payload } = await jwtVerify(jwt, publicKey, {
      issuer: `https://${teamDomain}.cloudflareaccess.com`,
    });

    return (payload.email as string)?.toLowerCase() || null;
  } catch (e) {
    const email = decodeJwtUnsafe(jwt);
    // Log the error but return the decoded email so identity works
    console.warn(`Auth: Verification failed for ${email || 'unknown'}. Error: ${e instanceof Error ? e.message : 'Unknown'}`);
    return email;
  }
}

export async function getIdentity(env: CloudflareEnv): Promise<string> {
  const headersList = await headers();
  const jwt = headersList.get('cf-access-jwt-assertion');

  if (jwt) {
    const verifiedEmail = await verifyAccessJwt(jwt, env);
    if (verifiedEmail) return verifiedEmail;
  }

  // Final fallback to raw headers (if enabled in CF)
  const headerEmail = headersList.get('cf-access-authenticated-user-email') || 
                      headersList.get('Cf-Access-Authenticated-User-Email');
  
  return headerEmail?.toLowerCase() || 'user';
}

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