import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getTokenFromRequest, requireAuth } from '@/lib/middleware';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Require authentication — unauthenticated requests must not generate slots
  const token = getTokenFromRequest(req);
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get('date');

  // Only allow dates today or in the future
  const today = new Date().toISOString().split('T')[0];
  const date = dateParam && dateParam >= today ? dateParam : today;

  // Only auto-generate slots if the doctor profile exists and is approved
  const doctorCheck = await query(
    'SELECT id FROM doctor_profiles WHERE id = $1 AND is_approved = true AND is_available = true',
    [id]
  );
  if (!doctorCheck.rows.length) {
    return NextResponse.json({ slots: [] });
  }

  const existing = await query(
    'SELECT * FROM doctor_slots WHERE doctor_id = $1 AND slot_date = $2 ORDER BY slot_time',
    [id, date]
  );

  if (existing.rows.length === 0) {
    const times = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30'];
    for (const t of times) {
      await query(
        'INSERT INTO doctor_slots (doctor_id, slot_date, slot_time) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
        [id, date, t]
      );
    }
    const fresh = await query(
      'SELECT * FROM doctor_slots WHERE doctor_id=$1 AND slot_date=$2 ORDER BY slot_time',
      [id, date]
    );
    return NextResponse.json({ slots: fresh.rows });
  }

  return NextResponse.json({ slots: existing.rows });
}
