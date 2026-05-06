import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ['admin', 'superadmin']);
  if (auth instanceof NextResponse) return auth;

  const [users, appointments, payments, pending, revenue, doctorStats, recentAppts] = await Promise.all([
    query("SELECT role, COUNT(*) as count FROM users GROUP BY role"),
    query("SELECT status, COUNT(*) as count FROM appointments GROUP BY status"),
    query("SELECT SUM(amount) as total, SUM(platform_commission) as commission FROM payments WHERE status='completed'"),
    query("SELECT COUNT(*) as count FROM users WHERE is_verified=false AND role IN ('doctor','assistant')"),
    query("SELECT DATE_TRUNC('month', created_at) as month, SUM(amount) as total FROM payments WHERE status='completed' GROUP BY month ORDER BY month DESC LIMIT 6"),
    query("SELECT dp.specialization, COUNT(*) as count, AVG(dp.rating) as avg_rating FROM doctor_profiles dp GROUP BY dp.specialization ORDER BY count DESC"),
    query(`SELECT a.*, pu.name as patient_name, du.name as doctor_name, dp.specialization
           FROM appointments a JOIN users pu ON a.patient_id=pu.id JOIN doctor_profiles dp ON a.doctor_id=dp.id JOIN users du ON dp.user_id=du.id
           ORDER BY a.created_at DESC LIMIT 10`),
  ]);

  return NextResponse.json({
    users: users.rows,
    appointments: appointments.rows,
    payments: payments.rows[0],
    pendingApprovals: pending.rows[0].count,
    revenueByMonth: revenue.rows,
    doctorStats: doctorStats.rows,
    recentAppointments: recentAppts.rows,
  });
}
