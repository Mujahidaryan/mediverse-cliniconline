import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/middleware';

// GET /api/doctor/profile — fetch the calling doctor's full profile
export async function GET(req: NextRequest) {
  const auth = requireRole(req, ['doctor']);
  if (auth instanceof NextResponse) return auth;

  const result = await query(
    `SELECT dp.*, u.name, u.email, u.phone FROM doctor_profiles dp
     JOIN users u ON dp.user_id = u.id WHERE dp.user_id = $1`,
    [auth.userId]
  );
  if (!result.rows.length) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  return NextResponse.json({ profile: result.rows[0] });
}

// PATCH /api/doctor/profile — toggle availability, update profile
export async function PATCH(req: NextRequest) {
  const auth = requireRole(req, ['doctor']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    if (typeof body.is_available === 'boolean') {
      await query(
        'UPDATE doctor_profiles SET is_available=$1 WHERE user_id=$2',
        [body.is_available, auth.userId]
      );
    }

    const result = await query(
      'SELECT * FROM doctor_profiles WHERE user_id=$1',
      [auth.userId]
    );
    return NextResponse.json({ profile: result.rows[0] });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
