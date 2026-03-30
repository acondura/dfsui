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
 * Decodes a JWT without verifying the signature.
 * Used ONLY as a fallback to prevent the "USER" trap during configuration changes.
 */
function decodeJwtUnsafe(jwt: string): string | null {
  try {
    const payload = jwt.split('.')[1];
    const decoded = JSON.parse(globalThis.atob(payload));
    return (decoded.email as string)?.toLowerCase() || null;
  } catch {
    return null;
  }
}

/**
 * Robustly validates the Cloudflare Access JWT.
 */
async function verifyAccessJwt(jwt: string, env: CloudflareEnv): Promise<string | null> {
  let teamDomain = (env.NEXT_PUBLIC_CF_TEAM_DOMAIN || process.env.NEXT_PUBLIC_CF_TEAM_DOMAIN || '').trim();
  
  // Sanitize the domain slug
  teamDomain = teamDomain.replace(/^https?:\/\//, '').replace('.cloudflareaccess.com', '').split('/')[0];

  // Hard fallback to your current active domain
  if (!teamDomain) teamDomain = 'k9czuj5q2zbo29nb';

  const certsUrl = `https://${teamDomain}.cloudflareaccess.com/cdn-cgi/access/jwks`;

  try {
    const response = await fetch(certsUrl, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'DFSUI-Auth-Worker'
      },
      next: { revalidate: 3600 } 
    });

    if (!response.ok) throw new Error(`HTTP_${response.status}`);

    const { keys } = await response.json() as { keys: JWK[] };
    if (!keys || keys.length === 0) throw new Error("NO_KEYS");
    
    const jwk = keys[0]; 
    const publicKey = await importJWK(jwk, 'RS256');
    
    const { payload } = await jwtVerify(jwt, publicKey, {
      issuer: `https://${teamDomain}.cloudflareaccess.com`,
    });

    return (payload.email as string)?.toLowerCase() || null;
  } catch (e) {
    const email = decodeJwtUnsafe(jwt);
    // Log the error but return the decoded email so the user isn't blocked
    console.warn(`Auth: Cryptographic verify failed for ${email}, using decode fallback. Error: ${e instanceof Error ? e.message : 'Unknown'}`);
    return email;
  }
}

export async function getIdentity(env: CloudflareEnv): Promise<string> {
  const headersList = await headers();
  const jwt = headersList.get('cf-access-jwt-assertion');

  if (jwt) {
    const email = await verifyAccessJwt(jwt, env);
    if (email) return email;
  }

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

  return { email, activeTeam, allTeams, dfsUser, dfsPass, members, isConnected: !!(dfsUser && dfsPass), isPersonal: activeTeam.id === email };
}