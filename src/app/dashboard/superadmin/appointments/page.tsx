'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';
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

const STATUS_STYLE = (s: string): React.CSSProperties => ({
  padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 500,
  ...(s === 'pending' ? { background: 'rgba(251,191,36,0.15)', color: '#FBD34D' }
    : s === 'confirmed' ? { background: 'rgba(34,197,94,0.15)', color: '#4ADE80' }
    : s === 'completed' ? { background: 'rgba(99,102,241,0.15)', color: '#A5B4FC' }
    : { background: 'rgba(239,68,68,0.15)', color: '#FC8181' }),
});

export default function AppointmentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.get(`/appointments${filter !== 'all' ? `?status=${filter}` : ''}`);
      setAppointments(d.appointments || []);
    } catch { toast.error('Failed to load appointments'); } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => {
    if (!user || !['superadmin', 'admin'].includes(user.role)) { router.push('/auth/login'); return; }
    load();
  }, [user, router, load]);

  const filtered = appointments.filter(a =>
    (a.patient_name as string)?.toLowerCase().includes(search.toLowerCase()) ||
    (a.doctor_name as string)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout navItems={NAV} role={user?.role || 'superadmin'}>
      <div style={{ maxWidth: '1200px' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
              <span style={{ background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>All Appointments</span>
            </h1>
            <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>{filtered.length} appointments on record.</p>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patient or doctor..." style={{ padding: '0.6rem 1rem', borderRadius: '9999px', background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(201,168,76,0.2)', color: '#F0F4FF', outline: 'none', fontSize: '0.875rem', fontFamily: 'inherit', minWidth: '240px' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: '0.45rem 1rem', borderRadius: '9999px', border: `1px solid ${filter === s ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.12)'}`, background: filter === s ? 'rgba(201,168,76,0.12)' : 'none', color: filter === s ? '#E5C97A' : 'rgba(240,244,255,0.5)', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'capitalize', fontFamily: 'inherit' }}>{s}</button>
          ))}
        </div>

        <div style={{ background: 'rgba(15,32,64,0.4)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '1.25rem', overflow: 'hidden' }}>
          {loading ? <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(240,244,255,0.4)' }}>Loading appointments...</div> : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(240,244,255,0.4)' }}>No appointments found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(10,22,40,0.4)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                    {['Patient', 'Doctor', 'Specialization', 'Date', 'Time', 'Type', 'Fee (PKR)', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '1rem 1.25rem', color: 'rgba(240,244,255,0.4)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id as string} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{a.patient_name as string}</td>
                      <td style={{ padding: '1rem 1.25rem', color: 'rgba(240,244,255,0.7)', whiteSpace: 'nowrap' }}>{a.doctor_name as string}</td>
                      <td style={{ padding: '1rem 1.25rem', color: 'rgba(240,244,255,0.5)', fontSize: '0.8rem' }}>{a.specialization as string}</td>
                      <td style={{ padding: '1rem 1.25rem', color: 'rgba(240,244,255,0.6)', whiteSpace: 'nowrap' }}>{new Date(a.appointment_date as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td style={{ padding: '1rem 1.25rem', color: 'rgba(240,244,255,0.5)', fontSize: '0.82rem' }}>{(a.appointment_time as string)?.slice(0, 5)}</td>
                      <td style={{ padding: '1rem 1.25rem' }}><span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', background: 'rgba(0,212,232,0.1)', color: '#00D4E8', textTransform: 'capitalize' }}>{a.type as string}</span></td>
                      <td style={{ padding: '1rem 1.25rem', color: '#4ADE80', fontWeight: 500 }}>{Number(a.consultation_fee).toLocaleString()}</td>
                      <td style={{ padding: '1rem 1.25rem' }}><span style={STATUS_STYLE(a.status as string)}>{a.status as string}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
