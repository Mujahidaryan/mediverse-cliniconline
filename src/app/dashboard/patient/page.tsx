'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const NAV = [
  { label: 'Dashboard', href: '/dashboard/patient', icon: '🏠' },
  { label: 'Book Consultation', href: '/dashboard/patient/book', icon: '📅' },
  { label: 'My Appointments', href: '/dashboard/patient/appointments', icon: '🗓️' },
  { label: 'Home Assistants', href: '/dashboard/patient/assistants', icon: '🏠' },
  { label: 'Health Records', href: '/dashboard/patient/records', icon: '📋' },
  { label: 'Payments', href: '/dashboard/patient/payments', icon: '💳' },
  { label: 'Profile', href: '/dashboard/patient/profile', icon: '👤' },
];

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'patient') { router.push('/auth/login'); return; }
    api.get('/appointments').then(d => setAppointments(d.appointments || [])).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  const upcoming = appointments.filter((a) => a.status === 'pending' || a.status === 'confirmed');
  const completed = appointments.filter((a) => a.status === 'completed');

  const statusStyle = (s: string) => ({
    padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 500,
    ...(s === 'pending' ? { background: 'rgba(251,191,36,0.15)', color: '#FBD34D' } :
       s === 'confirmed' ? { background: 'rgba(34,197,94,0.15)', color: '#4ADE80' } :
       s === 'completed' ? { background: 'rgba(99,102,241,0.15)', color: '#A5B4FC' } :
       { background: 'rgba(239,68,68,0.15)', color: '#FC8181' })
  });

  return (
    <DashboardLayout navItems={NAV} role="patient">
      <div style={{ maxWidth: '1100px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            Welcome back, <span style={{ background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name?.split(' ')[0]}</span>
          </h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Your health dashboard — all your care in one place.</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
          <StatCard label="Total Appointments" value={appointments.length} icon="📅" color="#C9A84C" />
          <StatCard label="Upcoming" value={upcoming.length} icon="🗓️" color="#00D4E8" />
          <StatCard label="Completed" value={completed.length} icon="✅" color="#4ADE80" />
          <StatCard label="Health Score" value="87%" icon="❤️" color="#F472B6" sub="Good condition" />
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: '🩺', label: 'Book Doctor', desc: 'General or specialist', href: '/dashboard/patient/book', color: '#00D4E8' },
            { icon: '🏠', label: 'Home Assistant', desc: 'Schedule home care', href: '/dashboard/patient/assistants', color: '#4ADE80' },
            { icon: '📋', label: 'Health Records', desc: 'View your history', href: '/dashboard/patient/records', color: '#F472B6' },
          ].map(a => (
            <button key={a.label} onClick={() => router.push(a.href)} style={{ padding: '1.5rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.5)', border: `1px solid ${a.color}20`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s', fontFamily: 'inherit' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${a.color}50`; (e.currentTarget as HTMLElement).style.background = `${a.color}08`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${a.color}20`; (e.currentTarget as HTMLElement).style.background = 'rgba(15,32,64,0.5)'; }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{a.icon}</div>
              <div style={{ fontWeight: 600, color: '#F0F4FF', marginBottom: '0.25rem' }}>{a.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(240,244,255,0.5)' }}>{a.desc}</div>
            </button>
          ))}
        </div>

        {/* Recent Appointments */}
        <div style={{ background: 'rgba(15,32,64,0.4)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '1.25rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Appointments</h2>
            <button onClick={() => router.push('/dashboard/patient/book')} style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', color: '#0A1628', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit' }}>+ Book New</button>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(240,244,255,0.4)' }}>Loading...</div>
          ) : appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(240,244,255,0.4)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📅</div>
              <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>No appointments yet</div>
              <button onClick={() => router.push('/dashboard/patient/book')} style={{ padding: '0.6rem 1.5rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', color: '#0A1628', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit', marginTop: '0.5rem' }}>Book your first appointment</button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr>
                    {['Doctor', 'Specialization', 'Date', 'Time', 'Fee', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.75rem 0.5rem', color: 'rgba(240,244,255,0.45)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(201,168,76,0.08)', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.id as string} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.875rem 0.5rem', fontWeight: 500 }}>{a.doctor_name as string}</td>
                      <td style={{ padding: '0.875rem 0.5rem', color: 'rgba(240,244,255,0.6)' }}>{a.specialization as string}</td>
                      <td style={{ padding: '0.875rem 0.5rem', color: 'rgba(240,244,255,0.6)' }}>{new Date(a.appointment_date as string).toLocaleDateString()}</td>
                      <td style={{ padding: '0.875rem 0.5rem', color: 'rgba(240,244,255,0.6)' }}>{(a.appointment_time as string)?.slice(0, 5)}</td>
                      <td style={{ padding: '0.875rem 0.5rem', color: '#C9A84C', fontWeight: 500 }}>PKR {Number(a.consultation_fee).toLocaleString()}</td>
                      <td style={{ padding: '0.875rem 0.5rem' }}><span style={statusStyle(a.status as string)}>{a.status as string}</span></td>
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
