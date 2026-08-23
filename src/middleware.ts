import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const config = {
  matcher: ['/dashboard/:path*'],
};

interface Env {
  dfsui: KVNamespace;
}

export default async function middleware(request: NextRequest) {
  // Development bypass — getIdentity() returns admin@example.com in dev anyway
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // Strip any client-provided x-user-email to prevent spoofing
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-user-email');

  const sessionToken = request.cookies.get('session')?.value;

  if (!sessionToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  try {
    const { env } = getRequestContext() as { env: Env };
    const raw = await env.dfsui.get(`session:${sessionToken}`);

    if (!raw) {
      // Session expired or invalid — clear cookie and redirect
      const url = new URL('/login', request.url);
      url.searchParams.set('from', request.nextUrl.pathname);
      const res = NextResponse.redirect(url);
      res.cookies.delete('session');
      return res;
    }

    const { email } = JSON.parse(raw) as { email: string };

    // Forward validated email to server components via request header
    requestHeaders.set('x-user-email', email);
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }
}
