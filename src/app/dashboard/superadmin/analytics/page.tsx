'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const NAV = [
  { label: 'Command Center', href: '/dashboard/superadmin', icon: '🛡️' },
  { label: 'User Management', href: '/dashboard/superadmin/users', icon: '👥' },
  { label: 'All Appointments', href: '/dashboard/superadmin/appointments', icon: '📅' },
  { label: 'Financials', href: '/dashboard/superadmin/financials', icon: '💰' },
  { label: 'Analytics', href: '/dashboard/superadmin/analytics', icon: '📊' },
  { label: 'System Logs', href: '/dashboard/superadmin/logs', icon: '📋' },
  { label: 'Settings', href: '/dashboard/superadmin/settings', icon: '⚙️' },
];

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !['superadmin', 'admin'].includes(user.role)) { router.push('/auth/login'); return; }
    api.get('/admin/stats').then(setStats).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, [user, router]);

  const users = (stats?.users as Record<string, string>[]) || [];
  const appts = (stats?.appointments as Record<string, string>[]) || [];
  const doctors = (stats?.doctorStats as Record<string, string>[]) || [];
  const totalUsers = users.reduce((s, u) => s + parseInt(u.count), 0) || 1;
  const totalAppts = appts.reduce((s, a) => s + parseInt(a.count), 0) || 1;
  const completionRate = Math.round((parseInt(appts.find(a => a.status === 'completed')?.count || '0') / totalAppts) * 100);
  const cancellationRate = Math.round((parseInt(appts.find(a => a.status === 'cancelled')?.count || '0') / totalAppts) * 100);

  const ROLE_COLORS: Record<string, string> = { patient: '#F472B6', doctor: '#00D4E8', assistant: '#4ADE80', admin: '#A5B4FC', superadmin: '#C9A84C' };
  const APPT_COLORS: Record<string, string> = { pending: '#FBD34D', confirmed: '#4ADE80', completed: '#A5B4FC', cancelled: '#FC8181' };

  return (
    <DashboardLayout navItems={NAV} role={user?.role || 'superadmin'}>
      <div style={{ maxWidth: '1100px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            <span style={{ background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Analytics</span>
          </h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Platform performance metrics and growth indicators.</p>
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(240,244,255,0.4)' }}>Loading analytics...</div> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
              <StatCard label="Total Users" value={totalUsers} icon="👥" color="#C9A84C" />
              <StatCard label="Total Appointments" value={totalAppts} icon="📅" color="#00D4E8" />
              <StatCard label="Completion Rate" value={`${completionRate}%`} icon="✅" color="#4ADE80" sub="of all appointments" />
              <StatCard label="Cancellation Rate" value={`${cancellationRate}%`} icon="❌" color="#FC8181" sub="of all appointments" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* User mix */}
              <div style={{ padding: '1.75rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.4)', border: '1px solid rgba(201,168,76,0.12)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', color: 'rgba(240,244,255,0.8)' }}>User Distribution</h3>
                {users.map(u => {
                  const pct = Math.round(parseInt(u.count) / totalUsers * 100);
                  const c = ROLE_COLORS[u.role] || '#C9A84C';
                  return (
                    <div key={u.role} style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                        <span style={{ textTransform: 'capitalize', color: 'rgba(240,244,255,0.7)' }}>{u.role}</span>
                        <span style={{ color: c, fontWeight: 600 }}>{u.count} <span style={{ color: 'rgba(240,244,255,0.35)', fontWeight: 400 }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height: '8px', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)' }}>
                        <div style={{ height: '100%', borderRadius: '9999px', background: c, width: `${pct}%`, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Appointment status mix */}
              <div style={{ padding: '1.75rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.4)', border: '1px solid rgba(201,168,76,0.12)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', color: 'rgba(240,244,255,0.8)' }}>Appointment Status Mix</h3>
                {appts.map(a => {
                  const pct = Math.round(parseInt(a.count) / totalAppts * 100);
                  const c = APPT_COLORS[a.status] || '#C9A84C';
                  return (
                    <div key={a.status} style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                        <span style={{ textTransform: 'capitalize', color: 'rgba(240,244,255,0.7)' }}>{a.status}</span>
                        <span style={{ color: c, fontWeight: 600 }}>{a.count} <span style={{ color: 'rgba(240,244,255,0.35)', fontWeight: 400 }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height: '8px', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)' }}>
                        <div style={{ height: '100%', borderRadius: '9999px', background: c, width: `${pct}%`, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Doctor specialization breakdown */}
            <div style={{ padding: '1.75rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.4)', border: '1px solid rgba(201,168,76,0.12)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', color: 'rgba(240,244,255,0.8)' }}>Doctors by Specialization</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
                {doctors.map(d => (
                  <div key={d.specialization} style={{ padding: '1rem 1.25rem', borderRadius: '0.875rem', background: 'rgba(10,22,40,0.4)', border: '1px solid rgba(0,212,232,0.1)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(240,244,255,0.5)', marginBottom: '0.4rem' }}>{d.specialization}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.5rem', fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', color: '#00D4E8', letterSpacing: '-0.5px' }}>{d.count}</span>
                      <span style={{ fontSize: '0.78rem', color: '#C9A84C' }}>⭐ {Number(d.avg_rating).toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
