import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const skill = searchParams.get('skill');
  const location = searchParams.get('location');

  let sql = `
    SELECT ap.*, u.name, u.email, u.phone, u.avatar_url
    FROM assistant_profiles ap
    JOIN users u ON ap.user_id = u.id
    WHERE ap.is_approved = true AND u.is_active = true
  `;
  const params: unknown[] = [];
  let idx = 1;

  if (skill) {
    sql += ` AND $${idx} = ANY(ap.skills)`;
    params.push(skill); idx++;
  }
  if (location) {
    sql += ` AND ap.location ILIKE $${idx}`;
    params.push(`%${location}%`); idx++;
  }
  sql += ' ORDER BY ap.rating DESC';

  const result = await query(sql, params);
  return NextResponse.json({ assistants: result.rows });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  if (auth.role !== 'patient') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { assistant_id, start_date, end_date, service_type, hours_per_day, address, notes } = await req.json();
    const aRes = await query('SELECT hourly_rate, daily_rate FROM assistant_profiles WHERE id=$1', [assistant_id]);
    const rate = aRes.rows[0]?.daily_rate || 0;
    const days = end_date ? Math.ceil((new Date(end_date).getTime() - new Date(start_date).getTime()) / 86400000) + 1 : 1;
    const total = rate * days;

    const result = await query(`
      INSERT INTO assistant_bookings (patient_id, assistant_id, start_date, end_date, service_type, hours_per_day, total_amount, address, notes, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending') RETURNING *
    `, [auth.userId, assistant_id, start_date, end_date, service_type, hours_per_day, total.toFixed(2), address, notes]);

    await query('INSERT INTO notifications (user_id, title, message, type) VALUES ($1,$2,$3,$4)',
      [auth.userId, 'Assistant Requested', `Your home assistant booking request has been submitted.`, 'info']);

    return NextResponse.json({ booking: result.rows[0] }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
