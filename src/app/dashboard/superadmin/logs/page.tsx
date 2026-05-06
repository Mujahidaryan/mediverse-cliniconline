'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';

const NAV = [
  { label: 'Command Center', href: '/dashboard/superadmin', icon: '🛡️' },
  { label: 'User Management', href: '/dashboard/superadmin/users', icon: '👥' },
  { label: 'All Appointments', href: '/dashboard/superadmin/appointments', icon: '📅' },
  { label: 'Financials', href: '/dashboard/superadmin/financials', icon: '💰' },
  { label: 'Analytics', href: '/dashboard/superadmin/analytics', icon: '📊' },
  { label: 'System Logs', href: '/dashboard/superadmin/logs', icon: '📋' },
  { label: 'Settings', href: '/dashboard/superadmin/settings', icon: '⚙️' },
];

export default function LogsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [recentAppts, setRecentAppts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !['superadmin', 'admin'].includes(user.role)) { router.push('/auth/login'); return; }
    api.get('/admin/stats').then(s => setRecentAppts(s.recentAppointments || [])).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  const STATUS_STYLE = (s: string): React.CSSProperties => ({
    padding: '0.15rem 0.55rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 500,
    ...(s === 'pending' ? { background: 'rgba(251,191,36,0.1)', color: '#FBD34D' }
      : s === 'confirmed' ? { background: 'rgba(34,197,94,0.1)', color: '#4ADE80' }
      : s === 'completed' ? { background: 'rgba(99,102,241,0.1)', color: '#A5B4FC' }
      : { background: 'rgba(239,68,68,0.1)', color: '#FC8181' }),
  });

  // Generate synthetic audit-log style entries from appointments
  const logs = recentAppts.flatMap((a, i) => [
    { ts: new Date(a.updated_at as string || a.created_at as string).toISOString(), level: 'INFO', event: 'appointment.status_changed', detail: `Appointment #${(a.id as string).slice(0, 8)} → ${a.status}`, actor: a.patient_name as string, status: a.status as string },
    { ts: new Date(a.created_at as string).toISOString(), level: 'INFO', event: 'appointment.created', detail: `${a.patient_name} booked ${a.doctor_name} for ${new Date(a.appointment_date as string).toLocaleDateString()}`, actor: a.patient_name as string, status: 'created' },
  ]).sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()).slice(0, 40);

  return (
    <DashboardLayout navItems={NAV} role={user?.role || 'superadmin'}>
      <div style={{ maxWidth: '1100px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            <span style={{ background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>System Logs</span>
          </h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Audit trail of platform events. Full structured logging requires an observability pipeline (e.g. Axiom, Datadog).</p>
        </div>

        <div style={{ padding: '1rem 1.5rem', borderRadius: '0.875rem', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#FBD34D', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <span>⚠️</span>
          <span>Showing activity derived from appointment records. For production audit logs with actor IPs, full request traces, and retention, connect an external log sink in <strong>Settings</strong>.</span>
        </div>

        <div style={{ background: 'rgba(10,18,36,0.7)', borderRadius: '1.25rem', border: '1px solid rgba(201,168,76,0.1)', padding: '0', overflow: 'hidden', fontFamily: 'monospace' }}>
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '1.5rem', fontSize: '0.72rem', color: 'rgba(240,244,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <span style={{ width: '180px' }}>Timestamp</span>
            <span style={{ width: '55px' }}>Level</span>
            <span style={{ width: '200px' }}>Event</span>
            <span>Detail</span>
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(240,244,255,0.3)' }}>Loading...</div> : logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(240,244,255,0.3)' }}>No log entries found.</div>
          ) : logs.map((log, i) => (
            <div key={i} style={{ padding: '0.6rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: '1.5rem', fontSize: '0.78rem', alignItems: 'flex-start' }}>
              <span style={{ color: 'rgba(240,244,255,0.3)', width: '180px', flexShrink: 0, fontSize: '0.72rem' }}>{new Date(log.ts).toLocaleString()}</span>
              <span style={{ width: '55px', flexShrink: 0, color: '#4ADE80', fontSize: '0.7rem', fontWeight: 600 }}>{log.level}</span>
              <span style={{ width: '200px', flexShrink: 0, color: '#00D4E8', fontSize: '0.72rem' }}>{log.event}</span>
              <span style={{ color: 'rgba(240,244,255,0.6)', flex: 1 }}>{log.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
