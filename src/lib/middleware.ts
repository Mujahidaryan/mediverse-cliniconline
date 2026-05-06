import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './auth';

export function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  const cookie = req.cookies.get('mediverse_token');
  return cookie?.value || null;
}

export function requireAuth(req: NextRequest): JWTPayload | NextResponse {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  return payload;
}

export function requireRole(req: NextRequest, roles: string[]): JWTPayload | NextResponse {
  const result = requireAuth(req);
  if (result instanceof NextResponse) return result;
  if (!roles.includes(result.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return result;
}

export function apiResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
