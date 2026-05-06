import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const result = await query(`
    SELECT u.id, u.name, u.email, u.role, u.phone, u.avatar_url, u.is_verified, u.created_at
    FROM users u WHERE u.id = $1
  `, [auth.userId]);
  if (!result.rows.length) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({ user: result.rows[0] });
}
