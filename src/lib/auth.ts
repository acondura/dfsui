// src/lib/auth.ts
import { headers } from 'next/headers';
import { z } from 'zod';

// Security Schema: Ensures data is a valid email and prevents injection
const emailSchema = z.string().email().toLowerCase().trim();
const teamIdSchema = z.string().min(1).trim();

export interface CloudflareEnv {
  dfsui: KVNamespace;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  EMAIL_FROM?: string;
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
 * Returns the authenticated user's email.
 * In production the middleware validates the session cookie and forwards the
 * email as the x-user-email request header. In development it returns a fixed
 * test identity so the KV/credentials flow can be exercised locally.
 */
export async function getIdentity(_env: CloudflareEnv): Promise<string> {
  if (process.env.NODE_ENV === 'development') {
    return 'admin@example.com';
  }

  const headersList = await headers();
  // Set by src/middleware.ts after successful session validation — never trust
  // a value supplied directly by the client (middleware strips it first).
  const email = headersList.get('x-user-email');

  if (!email) {
    throw new Error('Unauthorized');
  }

  const validated = emailSchema.safeParse(email);
  if (!validated.success) {
    throw new Error('Unauthorized');
  }

  return validated.data;
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
      adminEmails = Array.isArray(parsed) ? parsed : [String(parsed)];
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