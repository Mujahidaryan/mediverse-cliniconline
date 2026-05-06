'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';

const NAV = [
  { label: 'Dashboard', href: '/dashboard/patient', icon: '🏠' },
  { label: 'Book Consultation', href: '/dashboard/patient/book', icon: '📅' },
  { label: 'My Appointments', href: '/dashboard/patient/appointments', icon: '🗓️' },
  { label: 'Home Assistants', href: '/dashboard/patient/assistants', icon: '🤲' },
  { label: 'Health Records', href: '/dashboard/patient/records', icon: '📋' },
  { label: 'Payments', href: '/dashboard/patient/payments', icon: '💳' },
  { label: 'Profile', href: '/dashboard/patient/profile', icon: '👤' },
];

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'patient') { router.push('/auth/login'); return; }
    api.get('/appointments').then(d => setAppointments(d.appointments || [])).catch(() => {});
  }, [user, router]);

  const total = appointments.reduce((s, a) => s + Number(a.consultation_fee || 0), 0);
  const paid = appointments.filter(a => a.status === 'completed').reduce((s, a) => s + Number(a.consultation_fee || 0), 0);
  const pending = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').reduce((s, a) => s + Number(a.consultation_fee || 0), 0);

  const statusStyle = (s: string): React.CSSProperties => ({
    padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 500, display: 'inline-block',
    ...(s === 'pending' ? { background: 'rgba(251,191,36,0.15)', color: '#FBD34D' } :
       s === 'confirmed' ? { background: 'rgba(34,197,94,0.15)', color: '#4ADE80' } :
       s === 'completed' ? { background: 'rgba(99,102,241,0.15)', color: '#A5B4FC' } :
       { background: 'rgba(239,68,68,0.15)', color: '#FC8181' })
  });

  return (
    <DashboardLayout navItems={NAV} role="patient">
      <div style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            <span style={{ background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Payments</span>
          </h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Your complete billing and payment history.</p>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Billed', value: total, color: '#C9A84C', icon: '📊' },
            { label: 'Paid', value: paid, color: '#4ADE80', icon: '✅' },
            { label: 'Upcoming', value: pending, color: '#FBD34D', icon: '⏳' },
          ].map(c => (
            <div key={c.label} style={{ padding: '1.5rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.55)', border: `1px solid ${c.color}20` }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{c.icon}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2rem', color: c.color, letterSpacing: '-1px', lineHeight: 1 }}>
                PKR {c.value.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(240,244,255,0.5)', marginTop: '0.4rem' }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Transactions table */}
        <div style={{ background: 'rgba(15,32,64,0.4)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '1.25rem', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Transaction History</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'rgba(10,22,40,0.3)' }}>
                  {['Doctor', 'Specialization', 'Date', 'Amount', 'Payment Method', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.875rem 1.25rem', color: 'rgba(240,244,255,0.4)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'rgba(240,244,255,0.3)' }}>No payment history yet.</td></tr>
                ) : appointments.map((a) => (
                  <tr key={a.id as string} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>{a.doctor_name as string}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'rgba(240,244,255,0.6)', fontSize: '0.82rem' }}>{a.specialization as string}</td>
                    <td style={{ padding: '1rem 1.25rem', color: 'rgba(240,244,255,0.6)' }}>{new Date(a.appointment_date as string).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem 1.25rem', color: '#C9A84C', fontWeight: 600 }}>PKR {Number(a.consultation_fee).toLocaleString()}</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'rgba(240,244,255,0.6)' }}>
                        💳 Card
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}><span style={statusStyle(a.status as string)}>{a.status as string}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
