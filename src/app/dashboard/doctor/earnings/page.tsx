'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import StatCard from '@/components/StatCard';

const NAV = [
  { label: 'Dashboard', href: '/dashboard/doctor', icon: '🏠' },
  { label: 'Appointments', href: '/dashboard/doctor/appointments', icon: '🗓️' },
  { label: 'My Schedule', href: '/dashboard/doctor/schedule', icon: '📅' },
  { label: 'Patients', href: '/dashboard/doctor/patients', icon: '👥' },
  { label: 'Earnings', href: '/dashboard/doctor/earnings', icon: '💰' },
  { label: 'Profile', href: '/dashboard/doctor/profile', icon: '👤' },
];

export default function DoctorEarningsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'doctor') { router.push('/auth/login'); return; }
    api.get('/appointments').then(d => setAppointments(d.appointments || [])).catch(() => {});
  }, [user, router]);

  const completed = appointments.filter(a => a.status === 'completed');
  const gross = completed.reduce((s, a) => s + Number(a.consultation_fee || 0), 0);
  const commission = gross * 0.1;
  const net = gross - commission;
  const pending = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').reduce((s, a) => s + Number(a.consultation_fee || 0), 0) * 0.9;

  return (
    <DashboardLayout navItems={NAV} role="doctor">
      <div style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            <span style={{ background: 'linear-gradient(135deg,#00D4E8,#0099AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Earnings</span>
          </h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Your financial summary. Platform commission is 10%.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
          <StatCard label="Gross Revenue" value={`PKR ${gross.toLocaleString()}`} icon="💰" color="#C9A84C" />
          <StatCard label="Platform Fee (10%)" value={`PKR ${commission.toLocaleString()}`} icon="🏦" color="#FC8181" />
          <StatCard label="Net Earnings" value={`PKR ${net.toLocaleString()}`} icon="✅" color="#4ADE80" />
          <StatCard label="Pending Payout" value={`PKR ${Math.round(pending).toLocaleString()}`} icon="⏳" color="#FBD34D" />
        </div>

        {/* Earnings breakdown */}
        <div style={{ background: 'rgba(15,32,64,0.4)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '1.25rem', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(201,168,76,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Completed Consultations</h2>
            <span style={{ fontSize: '0.8rem', color: 'rgba(240,244,255,0.45)' }}>{completed.length} sessions</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'rgba(10,22,40,0.3)' }}>
                  {['Patient', 'Date', 'Type', 'Fee', 'Commission', 'Net'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.875rem 1.25rem', color: 'rgba(240,244,255,0.4)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completed.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'rgba(240,244,255,0.3)' }}>No completed consultations yet.</td></tr>
                ) : completed.map(a => {
                  const fee = Number(a.consultation_fee);
                  const comm = fee * 0.1;
                  return (
                    <tr key={a.id as string} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>{a.patient_name as string}</td>
                      <td style={{ padding: '1rem 1.25rem', color: 'rgba(240,244,255,0.6)' }}>{new Date(a.appointment_date as string).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem 1.25rem' }}><span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(201,168,76,0.1)', color: '#C9A84C', textTransform: 'capitalize' }}>{a.type as string}</span></td>
                      <td style={{ padding: '1rem 1.25rem', color: 'rgba(240,244,255,0.8)' }}>PKR {fee.toLocaleString()}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#FC8181' }}>-PKR {comm.toLocaleString()}</td>
                      <td style={{ padding: '1rem 1.25rem', color: '#4ADE80', fontWeight: 600 }}>PKR {(fee - comm).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
