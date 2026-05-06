import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, role = 'patient' } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    if (!['patient','doctor','assistant'].includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

    const exists = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const hash = await hashPassword(password);
    const result = await query(
      'INSERT INTO users (name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, role',
      [name, email.toLowerCase(), phone, hash, role]
    );
    const user = result.rows[0];

    // Create profile based on role
    if (role === 'patient') {
      await query('INSERT INTO patient_profiles (user_id) VALUES ($1)', [user.id]);
    } else if (role === 'doctor') {
      await query('INSERT INTO doctor_profiles (user_id, specialization) VALUES ($1, $2)', [user.id, 'General Physician']);
    } else if (role === 'assistant') {
      await query('INSERT INTO assistant_profiles (user_id) VALUES ($1)', [user.id]);
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role, name: user.name });

    const response = NextResponse.json({ success: true, token, user });
    response.cookies.set('mediverse_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
