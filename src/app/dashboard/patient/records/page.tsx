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

interface CompletedAppointment {
  id: string;
  appointment_date: string;
  doctor_name: string;
  specialization: string;
  symptoms: string;
  prescription: string;
  notes: string;
  type: string;
}

export default function RecordsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [records, setRecords] = useState<CompletedAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'patient') { router.push('/auth/login'); return; }
    api.get('/appointments?status=completed')
      .then(d => setRecords(
        (d.appointments || []).filter((a: Record<string, unknown>) => a.prescription || a.notes)
      ))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  if (loading) return <DashboardLayout navItems={NAV} role="patient"><div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(240,244,255,0.4)' }}>Loading records...</div></DashboardLayout>;

  return (
    <DashboardLayout navItems={NAV} role="patient">
      <div style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            <span style={{ background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Health Records</span>
          </h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Prescriptions and notes from your completed consultations.</p>
        </div>

        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(15,32,64,0.4)', borderRadius: '1.25rem', border: '1px solid rgba(201,168,76,0.1)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <div style={{ fontWeight: 500, marginBottom: '0.5rem', color: '#F0F4FF' }}>No records yet</div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(240,244,255,0.45)', maxWidth: '340px', margin: '0 auto' }}>Health records appear here once a doctor marks your appointment as completed and adds a prescription or notes.</div>
            <button onClick={() => router.push('/dashboard/patient/book')} style={{ marginTop: '1.5rem', padding: '0.65rem 1.75rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', color: '#0A1628', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>Book a Consultation →</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {records.map(r => (
              <div key={r.id} style={{ padding: '1.5rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.5)', border: '1px solid rgba(201,168,76,0.12)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{r.doctor_name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(240,244,255,0.5)' }}>{new Date(r.appointment_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                  <span style={{ padding: '0.2rem 0.75rem', borderRadius: '9999px', background: 'rgba(0,212,232,0.1)', border: '1px solid rgba(0,212,232,0.2)', color: '#00D4E8', fontSize: '0.75rem' }}>{r.specialization}</span>
                </div>
                {r.symptoms && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(240,244,255,0.4)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Symptoms Reported</div>
                    <div style={{ fontSize: '0.88rem', color: '#F0F4FF' }}>{r.symptoms}</div>
                  </div>
                )}
                {r.notes && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(240,244,255,0.4)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Doctor&apos;s Notes</div>
                    <div style={{ fontSize: '0.88rem', color: '#F0F4FF' }}>{r.notes}</div>
                  </div>
                )}
                {r.prescription && (
                  <div style={{ padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(10,22,40,0.4)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#A5B4FC', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Prescription</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(240,244,255,0.8)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{r.prescription}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
