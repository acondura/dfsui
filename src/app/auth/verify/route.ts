import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { CloudflareEnv } from '@/lib/auth';

export const runtime = 'edge';

// 30-day session lifetime
const SESSION_TTL = 60 * 60 * 24 * 30;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  // Validate token format before hitting KV (64 lowercase hex chars)
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.redirect(new URL('/login?error=invalid', request.url));
  }

  try {
    const { env } = getRequestContext() as { env: CloudflareEnv };

    const raw = await env.dfsui.get(`magic-link:${token}`);
    if (!raw) {
      return NextResponse.redirect(new URL('/login?error=expired', request.url));
    }

    const { email } = JSON.parse(raw) as { email: string };

    // Single-use: delete the magic link immediately
    await env.dfsui.delete(`magic-link:${token}`);

    // Create a new session
    const sessionToken = crypto.randomUUID();
    await env.dfsui.put(
      `session:${sessionToken}`,
      JSON.stringify({ email, createdAt: Date.now() }),
      { expirationTtl: SESSION_TTL }
    );

    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: SESSION_TTL,
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.redirect(new URL('/login?error=invalid', request.url));
  }
}
