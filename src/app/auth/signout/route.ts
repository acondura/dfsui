import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { CloudflareEnv } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('session')?.value;

  if (sessionToken) {
    try {
      const { env } = getRequestContext() as { env: CloudflareEnv };
      await env.dfsui.delete(`session:${sessionToken}`);
    } catch {
      // Best-effort — still clear the cookie even if KV fails
    }
  }

  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.delete('session');
  return response;
}
