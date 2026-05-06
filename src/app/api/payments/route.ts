import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    let result;
    if (['admin', 'superadmin'].includes(auth.role)) {
      // Admins see all payments with user context
      result = await query(
        `SELECT p.*, u.name as user_name, u.email as user_email
         FROM payments p JOIN users u ON p.user_id = u.id
         ORDER BY p.created_at DESC LIMIT 200`
      );
    } else {
      // Regular users see only their own payments
      result = await query(
        `SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC`,
        [auth.userId]
      );
    }
    return NextResponse.json({ payments: result.rows });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
