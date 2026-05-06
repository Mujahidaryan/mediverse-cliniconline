import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ['admin', 'superadmin']);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');

  let sql = `SELECT u.*, 
    CASE WHEN u.role='doctor' THEN dp.is_approved
         WHEN u.role='assistant' THEN ap.is_approved
         ELSE true END as profile_approved,
    dp.specialization, dp.consultation_fee, dp.rating as doctor_rating,
    ap.skills, ap.hourly_rate
    FROM users u
    LEFT JOIN doctor_profiles dp ON dp.user_id = u.id
    LEFT JOIN assistant_profiles ap ON ap.user_id = u.id
    WHERE 1=1`;
  const params: unknown[] = [];

  if (role) { sql += ` AND u.role=$1`; params.push(role); }
  sql += ' ORDER BY u.created_at DESC';

  const result = await query(sql, params);
  return NextResponse.json({ users: result.rows });
}

export async function PATCH(req: NextRequest) {
  const auth = requireRole(req, ['admin', 'superadmin']);
  if (auth instanceof NextResponse) return auth;

  const { userId, action } = await req.json();

  if (action === 'approve_doctor') {
    await query('UPDATE doctor_profiles SET is_approved=true WHERE user_id=$1', [userId]);
    await query('UPDATE users SET is_verified=true WHERE id=$1', [userId]);
    await query('INSERT INTO notifications (user_id, title, message, type) VALUES ($1,$2,$3,$4)',
      [userId, 'Account Approved', 'Your doctor profile has been approved. You can now receive appointments.', 'success']);
  } else if (action === 'approve_assistant') {
    await query('UPDATE assistant_profiles SET is_approved=true WHERE user_id=$1', [userId]);
    await query('UPDATE users SET is_verified=true WHERE id=$1', [userId]);
  } else if (action === 'deactivate') {
    await query('UPDATE users SET is_active=false WHERE id=$1', [userId]);
  } else if (action === 'activate') {
    await query('UPDATE users SET is_active=true WHERE id=$1', [userId]);
  }

  return NextResponse.json({ success: true });
}
