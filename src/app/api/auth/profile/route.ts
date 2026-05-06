import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function PATCH(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();

    // Update core user fields (name, phone)
    if (body.name || body.phone) {
      await query(
        'UPDATE users SET name=$1, phone=$2, updated_at=NOW() WHERE id=$3',
        [body.name, body.phone, auth.userId]
      );
    }

    // Update role-specific profile
    if (auth.role === 'patient') {
      await query(
        `UPDATE patient_profiles SET
          gender=$1, blood_group=$2, allergies=$3,
          chronic_conditions=$4, address=$5
         WHERE user_id=$6`,
        [body.gender, body.blood_group, body.allergies, body.chronic_conditions, body.address, auth.userId]
      );
    } else if (auth.role === 'doctor') {
      await query(
        `UPDATE doctor_profiles SET
          specialization=$1, qualification=$2, experience_years=$3,
          consultation_fee=$4, hospital=$5, location=$6,
          bio=$7, license_number=$8
         WHERE user_id=$9`,
        [
          body.specialization, body.qualification, body.experience_years,
          body.consultation_fee, body.hospital, body.location,
          body.bio, body.license_number, auth.userId,
        ]
      );
    } else if (auth.role === 'assistant') {
      const skills = Array.isArray(body.skills) ? body.skills : (body.skills ?? '').split(',').map((s: string) => s.trim()).filter(Boolean);
      await query(
        `UPDATE assistant_profiles SET
          skills=$1, experience_years=$2, hourly_rate=$3,
          daily_rate=$4, location=$5, bio=$6
         WHERE user_id=$7`,
        [skills, body.experience_years, body.hourly_rate, body.daily_rate, body.location, body.bio, auth.userId]
      );
    }

    // Return updated user
    const result = await query(
      'SELECT id, name, email, role, phone, avatar_url FROM users WHERE id=$1',
      [auth.userId]
    );
    return NextResponse.json({ success: true, user: result.rows[0] });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
