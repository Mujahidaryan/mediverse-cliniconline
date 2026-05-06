import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest } from '@/lib/middleware';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const specialization = searchParams.get('specialization');
  const search = searchParams.get('search');
  const available = searchParams.get('available');

  let sql = `
    SELECT dp.*, u.name, u.email, u.phone, u.avatar_url
    FROM doctor_profiles dp
    JOIN users u ON dp.user_id = u.id
    WHERE dp.is_approved = true AND u.is_active = true
  `;
  const params: unknown[] = [];
  let idx = 1;

  if (specialization && specialization !== 'all') {
    sql += ` AND dp.specialization = $${idx++}`;
    params.push(specialization);
  }
  if (search) {
    sql += ` AND (u.name ILIKE $${idx} OR dp.specialization ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  if (available === 'true') {
    sql += ` AND dp.is_available = true`;
  }

  sql += ` ORDER BY dp.rating DESC`;

  const result = await query(sql, params);
  return NextResponse.json({ doctors: result.rows });
}

export async function POST(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload || !['admin','superadmin'].includes(payload.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = await query(`
      UPDATE doctor_profiles SET
        specialization=$1, experience_years=$2, consultation_fee=$3,
        bio=$4, hospital=$5, location=$6, qualification=$7
      WHERE user_id=$8 RETURNING *
    `, [body.specialization, body.experience_years, body.consultation_fee,
        body.bio, body.hospital, body.location, body.qualification, body.user_id]);
    return NextResponse.json({ doctor: result.rows[0] });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
