'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const NAV = [
  { label: 'Dashboard', href: '/dashboard/patient', icon: '🏠' },
  { label: 'Book Consultation', href: '/dashboard/patient/book', icon: '📅' },
  { label: 'My Appointments', href: '/dashboard/patient/appointments', icon: '🗓️' },
  { label: 'Home Assistants', href: '/dashboard/patient/assistants', icon: '🤲' },
  { label: 'Health Records', href: '/dashboard/patient/records', icon: '📋' },
  { label: 'Payments', href: '/dashboard/patient/payments', icon: '💳' },
  { label: 'Profile', href: '/dashboard/patient/profile', icon: '👤' },
];

export default function AppointmentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'patient') { router.push('/auth/login'); return; }
    const params = filter !== 'all' ? `?status=${filter}` : '';
    api.get(`/appointments${params}`).then(d => setAppointments(d.appointments || [])).catch(() => {}).finally(() => setLoading(false));
  }, [user, router, filter]);

  const cancel = async (id: string) => {
    try {
      await api.patch('/appointments', { id, status: 'cancelled', prescription: null, notes: 'Cancelled by patient' });
      toast.success('Appointment cancelled');
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    } catch { toast.error('Failed to cancel'); }
  };

  const statusStyle = (s: string): React.CSSProperties => ({
    padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 500, display: 'inline-block',
    ...(s === 'pending' ? { background: 'rgba(251,191,36,0.15)', color: '#FBD34D' } :
       s === 'confirmed' ? { background: 'rgba(34,197,94,0.15)', color: '#4ADE80' } :
       s === 'completed' ? { background: 'rgba(99,102,241,0.15)', color: '#A5B4FC' } :
       { background: 'rgba(239,68,68,0.15)', color: '#FC8181' })
  });

  const FILTERS = ['all','pending','confirmed','completed','cancelled'];

  return (
    <DashboardLayout navItems={NAV} role="patient">
      <div style={{ maxWidth: '1100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
              <span style={{ background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Appointments</span>
            </h1>
            <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>{appointments.length} total appointments</p>
          </div>
          <button onClick={() => router.push('/dashboard/patient/book')} style={{ padding: '0.65rem 1.5rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', color: '#0A1628', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit' }}>+ Book New</button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.45rem 1rem', borderRadius: '9999px', border: `1px solid ${filter === f ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.12)'}`, background: filter === f ? 'rgba(201,168,76,0.12)' : 'none', color: filter === f ? '#E5C97A' : 'rgba(240,244,255,0.55)', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'capitalize', fontFamily: 'inherit' }}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(240,244,255,0.4)' }}>Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(15,32,64,0.4)', borderRadius: '1.25rem', border: '1px solid rgba(201,168,76,0.08)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>No appointments found</div>
            <div style={{ color: 'rgba(240,244,255,0.4)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Book your first consultation now</div>
            <button onClick={() => router.push('/dashboard/patient/book')} style={{ padding: '0.65rem 1.75rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', color: '#0A1628', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>Book Appointment</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {appointments.map((a) => (
              <div key={a.id as string} style={{ padding: '1.5rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.5)', border: '1px solid rgba(201,168,76,0.1)', display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#00D4E844,#00D4E822)', border: '2px solid #00D4E830', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>👨‍⚕️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.15rem' }}>{a.doctor_name as string}</div>
                      <div style={{ fontSize: '0.82rem', color: '#00D4E8' }}>{a.specialization as string} · {a.hospital as string}</div>
                    </div>
                    <span style={statusStyle(a.status as string)}>{a.status as string}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'rgba(240,244,255,0.55)', marginBottom: '0.75rem' }}>
                    <span>📅 {new Date(a.appointment_date as string).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span>🕐 {(a.appointment_time as string)?.slice(0, 5)}</span>
                    <span style={{ color: '#C9A84C', fontWeight: 500 }}>PKR {Number(a.consultation_fee).toLocaleString()}</span>
                  </div>
                  {Boolean(a.symptoms) && <div style={{ fontSize: '0.8rem', color: 'rgba(240,244,255,0.5)', fontStyle: 'italic' }}>"{a.symptoms as string}"</div>}
                  {Boolean(a.prescription) && (
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(10,22,40,0.4)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <div style={{ fontSize: '0.72rem', color: '#A5B4FC', marginBottom: '0.25rem' }}>PRESCRIPTION</div>
                      <div style={{ fontSize: '0.85rem' }}>{a.prescription as string}</div>
                    </div>
                  )}
                </div>
                {(a.status === 'pending' || a.status === 'confirmed') && (
                  <button onClick={() => cancel(a.id as string)} style={{ padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid rgba(239,68,68,0.25)', color: '#FC8181', background: 'none', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Cancel</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
