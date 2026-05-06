'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';
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

export default function DoctorAppointmentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [prescribing, setPrescribing] = useState<string | null>(null);
  const [prescription, setPrescription] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'doctor') { router.push('/auth/login'); return; }
    const params = filter !== 'all' ? `?status=${filter}` : '';
    api.get(`/appointments${params}`).then(d => setAppointments(d.appointments || [])).catch(() => {}).finally(() => setLoading(false));
  }, [user, router, filter]);

  const updateStatus = async (id: string, status: string, rx?: string) => {
    try {
      await api.patch('/appointments', { id, status, prescription: rx || null, notes: null });
      toast.success(`Status updated to ${status}`);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status, prescription: rx || a.prescription } : a));
      setPrescribing(null);
      setPrescription('');
    } catch { toast.error('Update failed'); }
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
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
              <span style={{ background: 'linear-gradient(135deg,#00D4E8,#0099AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>All Appointments</span>
            </h1>
            <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>{appointments.length} total patient appointments</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.45rem 1rem', borderRadius: '9999px', border: `1px solid ${filter === f ? 'rgba(0,212,232,0.45)' : 'rgba(0,212,232,0.12)'}`, background: filter === f ? 'rgba(0,212,232,0.1)' : 'none', color: filter === f ? '#00D4E8' : 'rgba(240,244,255,0.55)', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'capitalize', fontFamily: 'inherit' }}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(240,244,255,0.4)' }}>Loading appointments...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {appointments.map(a => (
              <div key={a.id as string} style={{ padding: '1.5rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.5)', border: '1px solid rgba(0,212,232,0.1)' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#F472B644,#F472B822)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>👤</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.15rem' }}>{a.patient_name as string}</div>
                        <div style={{ fontSize: '0.78rem', color: 'rgba(240,244,255,0.5)' }}>📞 {a.patient_phone as string || 'N/A'} · {a.patient_email as string}</div>
                        {Boolean(a.blood_group) && <div style={{ fontSize: '0.72rem', color: '#C9A84C', marginTop: '0.1rem' }}>Blood: {a.blood_group as string}</div>}
                        {Boolean(a.allergies) && <div style={{ fontSize: '0.72rem', color: '#FC8181', marginTop: '0.1rem' }}>⚠️ Allergies: {a.allergies as string}</div>}
                      </div>
                      <span style={statusStyle(a.status as string)}>{a.status as string}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'rgba(240,244,255,0.55)', marginBottom: '0.75rem' }}>
                      <span>📅 {new Date(a.appointment_date as string).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span>🕐 {(a.appointment_time as string)?.slice(0, 5)}</span>
                      <span style={{ textTransform: 'capitalize' }}>Type: {a.type as string}</span>
                      <span style={{ color: '#C9A84C', fontWeight: 500 }}>PKR {Number(a.consultation_fee).toLocaleString()}</span>
                    </div>
                    {Boolean(a.symptoms) && (
                      <div style={{ padding: '0.6rem 0.875rem', borderRadius: '0.6rem', background: 'rgba(10,22,40,0.4)', marginBottom: '0.75rem', fontSize: '0.82rem', color: 'rgba(240,244,255,0.65)', fontStyle: 'italic' }}>
                        💬 &quot;{a.symptoms as string}&quot;
                      </div>
                    )}
                    {Boolean(a.prescription) && (
                      <div style={{ padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.72rem', color: '#A5B4FC', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Prescription</div>
                        <div style={{ fontSize: '0.85rem' }}>{a.prescription as string}</div>
                      </div>
                    )}
                    {prescribing === a.id && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <textarea value={prescription} onChange={e => setPrescription(e.target.value)} placeholder="Write prescription and notes here..." style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(99,102,241,0.25)', color: '#F0F4FF', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: '90px' }} />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button onClick={() => updateStatus(a.id as string, 'completed', prescription)} style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#A5B4FC,#818CF8)', color: '#0A1628', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'inherit' }}>Save & Complete</button>
                          <button onClick={() => { setPrescribing(null); setPrescription(''); }} style={{ padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(240,244,255,0.5)', background: 'none', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>Cancel</button>
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {a.status === 'pending' && (
                        <button onClick={() => updateStatus(a.id as string, 'confirmed')} style={{ padding: '0.4rem 0.875rem', borderRadius: '9999px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ADE80', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit' }}>✓ Confirm</button>
                      )}
                      {(a.status === 'confirmed' || a.status === 'pending') && (
                        <button onClick={() => { setPrescribing(a.id as string); setPrescription(a.prescription as string || ''); }} style={{ padding: '0.4rem 0.875rem', borderRadius: '9999px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#A5B4FC', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit' }}>📝 Write Prescription</button>
                      )}
                      {a.status !== 'completed' && a.status !== 'cancelled' && (
                        <button onClick={() => updateStatus(a.id as string, 'cancelled')} style={{ padding: '0.4rem 0.875rem', borderRadius: '9999px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FC8181', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit' }}>Cancel</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {appointments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(15,32,64,0.3)', borderRadius: '1.25rem', border: '1px solid rgba(0,212,232,0.08)', color: 'rgba(240,244,255,0.4)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗓️</div>
                No appointments found for this filter.
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
