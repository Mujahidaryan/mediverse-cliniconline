import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  let sql = '';
  const params: unknown[] = [];

  if (auth.role === 'patient') {
    sql = `
      SELECT a.*, dp.specialization, dp.consultation_fee as fee,
             u.name as doctor_name, u.avatar_url as doctor_avatar,
             dp.hospital, dp.rating
      FROM appointments a
      JOIN doctor_profiles dp ON a.doctor_id = dp.id
      JOIN users u ON dp.user_id = u.id
      WHERE a.patient_id = $1
    `;
    params.push(auth.userId);
  } else if (auth.role === 'doctor') {
    sql = `
      SELECT a.*, pu.name as patient_name, pu.phone as patient_phone,
             pu.email as patient_email, pp.blood_group, pp.allergies
      FROM appointments a
      JOIN users pu ON a.patient_id = pu.id
      LEFT JOIN patient_profiles pp ON pp.user_id = pu.id
      JOIN doctor_profiles dp ON a.doctor_id = dp.id
      WHERE dp.user_id = $1
    `;
    params.push(auth.userId);
  } else if (['admin','superadmin'].includes(auth.role)) {
    sql = `
      SELECT a.*, 
             pu.name as patient_name, pu.email as patient_email,
             du.name as doctor_name, dp.specialization
      FROM appointments a
      JOIN users pu ON a.patient_id = pu.id
      JOIN doctor_profiles dp ON a.doctor_id = dp.id
      JOIN users du ON dp.user_id = du.id
      WHERE 1=1
    `;
  }

  if (status) {
    sql += ` AND a.status = $${params.length + 1}`;
    params.push(status);
  }
  sql += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT 100`;

  const result = await query(sql, params);
  return NextResponse.json({ appointments: result.rows });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  if (auth.role !== 'patient') return NextResponse.json({ error: 'Only patients can book' }, { status: 403 });

  try {
    const { doctor_id, slot_id, appointment_date, appointment_time, type, symptoms } = await req.json();

    // Check slot availability
    if (slot_id) {
      const slotCheck = await query('SELECT * FROM doctor_slots WHERE id=$1 AND is_booked=false', [slot_id]);
      if (!slotCheck.rows.length) return NextResponse.json({ error: 'Slot not available' }, { status: 409 });
    }

    // Get fee
    const docRes = await query('SELECT consultation_fee FROM doctor_profiles WHERE id=$1', [doctor_id]);
    const fee = docRes.rows[0]?.consultation_fee || 0;

    const result = await query(`
      INSERT INTO appointments (patient_id, doctor_id, slot_id, appointment_date, appointment_time, type, status, symptoms, consultation_fee)
      VALUES ($1,$2,$3,$4,$5,$6,'pending',$7,$8) RETURNING *
    `, [auth.userId, doctor_id, slot_id || null, appointment_date, appointment_time, type || 'general', symptoms || '', fee]);

    // Mark slot as booked
    if (slot_id) {
      await query('UPDATE doctor_slots SET is_booked=true WHERE id=$1', [slot_id]);
    }

    // Create payment record
    const commission = parseFloat(fee) * 0.1;
    await query(`
      INSERT INTO payments (user_id, reference_id, reference_type, amount, platform_commission, net_amount, status)
      VALUES ($1,$2,'appointment',$3,$4,$5,'pending')
    `, [auth.userId, result.rows[0].id, fee, commission.toFixed(2), (fee - commission).toFixed(2)]);

    // Notification
    await query('INSERT INTO notifications (user_id, title, message, type) VALUES ($1,$2,$3,$4)',
      [auth.userId, 'Booking Confirmed', `Your appointment on ${appointment_date} at ${appointment_time} is confirmed.`, 'success']);

    return NextResponse.json({ appointment: result.rows[0] }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Valid transitions per role
const ALLOWED_TRANSITIONS: Record<string, Record<string, string[]>> = {
  doctor:    { pending: ['confirmed', 'cancelled'], confirmed: ['completed', 'cancelled'] },
  patient:   { pending: ['cancelled'], confirmed: ['cancelled'] },
  admin:     { pending: ['confirmed', 'cancelled'], confirmed: ['completed', 'cancelled'] },
  superadmin:{ pending: ['confirmed', 'cancelled'], confirmed: ['completed', 'cancelled'] },
};

export async function PATCH(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id, status, prescription, notes } = await req.json();
    if (!id || !status) return NextResponse.json({ error: 'id and status are required' }, { status: 400 });

    // Fetch the appointment to verify ownership and current state
    const apptRes = await query(
      `SELECT a.*, dp.user_id as doctor_user_id FROM appointments a
       LEFT JOIN doctor_profiles dp ON a.doctor_id = dp.id
       WHERE a.id = $1`,
      [id]
    );
    if (!apptRes.rows.length) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    const appt = apptRes.rows[0];

    // Ownership check: patient can only touch their own, doctor can only touch theirs
    if (auth.role === 'patient' && appt.patient_id !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (auth.role === 'doctor' && appt.doctor_user_id !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // State transition check
    const allowed = ALLOWED_TRANSITIONS[auth.role]?.[appt.status] ?? [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from '${appt.status}' to '${status}' as ${auth.role}` },
        { status: 422 }
      );
    }

    // Patients cannot write prescriptions or notes
    const newPrescription = auth.role === 'patient' ? appt.prescription : (prescription ?? appt.prescription);
    const newNotes        = auth.role === 'patient' ? appt.notes        : (notes        ?? appt.notes);

    const result = await query(
      'UPDATE appointments SET status=$1, prescription=$2, notes=$3, updated_at=NOW() WHERE id=$4 RETURNING *',
      [status, newPrescription, newNotes, id]
    );
    return NextResponse.json({ appointment: result.rows[0] });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
