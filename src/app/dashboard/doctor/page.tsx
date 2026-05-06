'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const NAV = [
  { label: 'Dashboard', href: '/dashboard/doctor', icon: '🏠' },
  { label: 'Appointments', href: '/dashboard/doctor/appointments', icon: '🗓️' },
  { label: 'My Schedule', href: '/dashboard/doctor/schedule', icon: '📅' },
  { label: 'Patients', href: '/dashboard/doctor/patients', icon: '👥' },
  { label: 'Earnings', href: '/dashboard/doctor/earnings', icon: '💰' },
  { label: 'Profile', href: '/dashboard/doctor/profile', icon: '👤' },
];

export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'doctor') { router.push('/auth/login'); return; }
    api.get('/appointments').then(d => setAppointments(d.appointments || [])).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => (a.appointment_date as string)?.startsWith(today));
  const pending = appointments.filter(a => a.status === 'pending');
  const completed = appointments.filter(a => a.status === 'completed');

  const updateStatus = async (id: string, status: string, prescription?: string) => {
    try {
      await api.patch('/appointments', { id, status, prescription: prescription || null, notes: null });
      toast.success(`Appointment ${status}`);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch { toast.error('Failed to update'); }
  };

  const statusStyle = (s: string): React.CSSProperties => ({
    padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 500, display: 'inline-block',
    ...(s === 'pending' ? { background: 'rgba(251,191,36,0.15)', color: '#FBD34D' } :
       s === 'confirmed' ? { background: 'rgba(34,197,94,0.15)', color: '#4ADE80' } :
       s === 'completed' ? { background: 'rgba(99,102,241,0.15)', color: '#A5B4FC' } :
       { background: 'rgba(239,68,68,0.15)', color: '#FC8181' })
  });

  return (
    <DashboardLayout navItems={NAV} role="doctor">
      <div style={{ maxWidth: '1100px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            Dr. <span style={{ background: 'linear-gradient(135deg,#00D4E8,#0099AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name?.replace('Dr. ', '')}</span>
          </h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Your clinical dashboard — manage patients and appointments.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
          <StatCard label="Total Appointments" value={appointments.length} icon="📅" color="#00D4E8" />
          <StatCard label="Today" value={todayAppts.length} icon="🗓️" color="#C9A84C" />
          <StatCard label="Pending Review" value={pending.length} icon="⏳" color="#FBD34D" />
          <StatCard label="Completed" value={completed.length} icon="✅" color="#4ADE80" />
        </div>

        {/* Today's appointments */}
        <div style={{ background: 'rgba(15,32,64,0.4)', border: '1px solid rgba(0,212,232,0.15)', borderRadius: '1.25rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: '#00D4E8' }}>📅 Today&apos;s Appointments</h2>
          {todayAppts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(240,244,255,0.4)', fontSize: '0.875rem' }}>No appointments scheduled for today.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {todayAppts.map(a => (
                <div key={a.id as string} style={{ padding: '1.25rem', borderRadius: '1rem', background: 'rgba(10,22,40,0.5)', border: '1px solid rgba(0,212,232,0.1)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg,#F472B644,#F472B822)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>👤</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.15rem' }}>{a.patient_name as string}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(240,244,255,0.5)' }}>{a.patient_phone as string} · 🕐 {(a.appointment_time as string)?.slice(0, 5)}</div>
                    {Boolean(a.allergies) && <div style={{ fontSize: '0.72rem', color: '#FC8181', marginTop: '0.2rem' }}>⚠️ Allergies: {a.allergies as string}</div>}
                  </div>
                  <span style={statusStyle(a.status as string)}>{a.status as string}</span>
                  {a.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => updateStatus(a.id as string, 'confirmed')} style={{ padding: '0.4rem 0.875rem', borderRadius: '9999px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ADE80', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit' }}>Confirm</button>
                      <button onClick={() => updateStatus(a.id as string, 'completed')} style={{ padding: '0.4rem 0.875rem', borderRadius: '9999px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#A5B4FC', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit' }}>Complete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All appointments table */}
        <div style={{ background: 'rgba(15,32,64,0.4)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '1.25rem', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>All Appointments</h2>
          {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(240,244,255,0.4)' }}>Loading...</div> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr>{['Patient', 'Date', 'Time', 'Type', 'Fee', 'Status', 'Action'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.75rem 0.5rem', color: 'rgba(240,244,255,0.45)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(201,168,76,0.08)', fontWeight: 500 }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a.id as string} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.875rem 0.5rem', fontWeight: 500 }}>{a.patient_name as string}</td>
                      <td style={{ padding: '0.875rem 0.5rem', color: 'rgba(240,244,255,0.6)' }}>{new Date(a.appointment_date as string).toLocaleDateString()}</td>
                      <td style={{ padding: '0.875rem 0.5rem', color: 'rgba(240,244,255,0.6)' }}>{(a.appointment_time as string)?.slice(0, 5)}</td>
                      <td style={{ padding: '0.875rem 0.5rem' }}><span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(201,168,76,0.1)', color: '#C9A84C', textTransform: 'capitalize' }}>{a.type as string}</span></td>
                      <td style={{ padding: '0.875rem 0.5rem', color: '#C9A84C', fontWeight: 500 }}>PKR {Number(a.consultation_fee).toLocaleString()}</td>
                      <td style={{ padding: '0.875rem 0.5rem' }}><span style={statusStyle(a.status as string)}>{a.status as string}</span></td>
                      <td style={{ padding: '0.875rem 0.5rem' }}>
                        {a.status === 'confirmed' && (
                          <button onClick={() => updateStatus(a.id as string, 'completed')} style={{ padding: '0.3rem 0.75rem', borderRadius: '9999px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#A5B4FC', cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'inherit' }}>Mark Done</button>
                        )}
                        {a.status === 'pending' && (
                          <button onClick={() => updateStatus(a.id as string, 'confirmed')} style={{ padding: '0.3rem 0.75rem', borderRadius: '9999px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ADE80', cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'inherit' }}>Confirm</button>
                        )}
                      </td>
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
