import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard'];
const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/', '/api/auth/login', '/api/auth/register', '/api/doctors', '/api/assistants'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get('mediverse_token')?.value;
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode JWT payload without verifying signature (edge runtime has no crypto for RS256/HS256 easily)
  // Full verification happens in each API route handler via verifyToken(). Here we just check presence + expiry.
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) throw new Error('malformed');
    const payload = JSON.parse(atob(payloadBase64));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      // Expired — clear cookie and redirect
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/auth/login';
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('mediverse_token');
      return res;
    }

    // Role-based path guards
    const role: string = payload.role ?? '';
    if (pathname.startsWith('/dashboard/superadmin') && !['superadmin'].includes(role)) {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
    if (pathname.startsWith('/dashboard/admin') && !['admin', 'superadmin'].includes(role)) {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
    if (pathname.startsWith('/dashboard/doctor') && role !== 'doctor') {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
    if (pathname.startsWith('/dashboard/patient') && role !== 'patient') {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
    if (pathname.startsWith('/dashboard/assistant') && role !== 'assistant') {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
  } catch {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete('mediverse_token');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
