// src/lib/auth.ts
import { headers } from 'next/headers';
import { importJWK, jwtVerify } from 'jose';
import { z } from 'zod';

// Security Schema: Ensures data is a valid email and prevents injection
const emailSchema = z.string().email().toLowerCase().trim();
const teamIdSchema = z.string().min(1).trim();

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
    return (payload.email || payload.sub || null)?.toLowerCase();
  } catch {
    return null;
  }
}

async function verifyAccessJwt(jwt: string, env: CloudflareEnv): Promise<string | null> {
  let teamDomain = (env.NEXT_PUBLIC_CF_TEAM_DOMAIN || process.env.NEXT_PUBLIC_CF_TEAM_DOMAIN || '').trim();
  teamDomain = teamDomain.replace(/^https?:\/\//, '').replace('.cloudflareaccess.com', '').split('/')[0];
  
  if (!teamDomain) return null;

  // Restored multi-endpoint logic for JWKS and Certs
  const endpoints = [
    `https://${teamDomain}.cloudflareaccess.com/cdn-cgi/access/jwks`,
    `https://${teamDomain}.cloudflareaccess.com/cdn-cgi/access/certs`
  ];

  let keys: JWK[] = [];
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
    } catch {
      continue;
    }
  }

  try {
    if (keys.length === 0) return null;
    
    // Attempt verification with the first available key
    const publicKey = await importJWK(keys[0], 'RS256');
    const { payload } = await jwtVerify(jwt, publicKey, {
      issuer: `https://${teamDomain}.cloudflareaccess.com`,
    });

    const validated = emailSchema.safeParse(payload.email);
    return validated.success ? validated.data : null;
  } catch (e) {
    const attemptedEmail = decodeJwtUnsafe(jwt);
    console.error(`Security Alert: Invalid JWT for ${attemptedEmail || 'unknown'}. Error: ${e instanceof Error ? e.message : 'Unknown'}`);
    return null; // FAIL CLOSED
  }
}

export async function getIdentity(env: CloudflareEnv): Promise<string> {
  if (process.env.NODE_ENV === 'development') {
    return 'admin@example.com'; 
  }

  const headersList = await headers();
  const jwt = headersList.get('cf-access-jwt-assertion');

  if (jwt) {
    const verifiedEmail = await verifyAccessJwt(jwt, env);
    if (verifiedEmail) return verifiedEmail;
  }

  const headerEmail = headersList.get('cf-access-authenticated-user-email') || 
                      headersList.get('Cf-Access-Authenticated-User-Email');
  
  const validated = emailSchema.safeParse(headerEmail);
  if (validated.success) return validated.data;

  throw new Error("Unauthorized: Identity could not be verified.");
}

export async function getTeamContext(env: CloudflareEnv) {
  const email = await getIdentity(env);

  if (!env?.dfsui) {
    return { 
      email, 
      activeTeam: { id: email, name: 'Personal Workspace (Local)', isOwner: true }, 
      allTeams: [{ id: email, name: 'Personal Workspace (Local)', isOwner: true }], 
      dfsUser: null, dfsPass: null, members: [email], isConnected: false, isPersonal: true
    };
  }

  const activeTeamIdRaw = await env.dfsui.get(`user:${email}:active-team`) || email;
  const activeTeamId = teamIdSchema.parse(activeTeamIdRaw);

  const teamsRaw = await env.dfsui.get(`user:${email}:teams`);
  const teamIds = teamsRaw ? (JSON.parse(teamsRaw) as string[]) : [];
  if (!teamIds.includes(email)) teamIds.push(email);

  const allTeams = await Promise.all(teamIds.map(async (id) => {
    const safeId = teamIdSchema.parse(id);
    const [name, membersRaw] = await Promise.all([
      env.dfsui.get(`team:${safeId}:name`),
      env.dfsui.get(`team:${safeId}:members`)
    ]);
    
    const members = membersRaw ? (JSON.parse(membersRaw) as string[]) : [safeId];
    return {
      id: safeId,
      name: name || (safeId === email ? 'Personal Workspace' : safeId.split('-')[0]),
      isOwner: safeId === email || members[0] === email
    };
  }));

  const activeTeam = allTeams.find(t => t.id === activeTeamId) || allTeams[0];

  const [dfsUser, dfsPass, membersRaw] = await Promise.all([
    env.dfsui.get(`team:${activeTeam.id}:dfs-user`),
    env.dfsui.get(`team:${activeTeam.id}:dfs-pass`),
    env.dfsui.get(`team:${activeTeam.id}:members`)
  ]);

  const members = membersRaw ? (JSON.parse(membersRaw) as string[]) : [activeTeam.id];

  if (!members.includes(email) && activeTeam.id !== email) {
    throw new Error("Unauthorized: Access to this team is forbidden.");
  }

  // Multi-Admin Logic: The first person to log in becomes the initial admin
  const adminRaw = await env.dfsui.get('app:admin');
  let adminEmails: string[] = [];
  
  if (adminRaw) {
    try {
      const parsed = JSON.parse(adminRaw);
      adminEmails = Array.isArray(parsed) ? parsed : [adminRaw];
    } catch {
      // Legacy support: if it's a plain string like "admin@example.com"
      adminEmails = [adminRaw];
    }
  }
  
  if (adminEmails.length === 0) {
    adminEmails = [email];
    await env.dfsui.put('app:admin', JSON.stringify(adminEmails));
  }
  
  const isAdmin = adminEmails.includes(email);

  return { 
    email, activeTeam, allTeams, dfsUser, dfsPass, members, isAdmin,
    isConnected: !!(dfsUser && dfsPass),
    isPersonal: activeTeam.id === email
  };
}