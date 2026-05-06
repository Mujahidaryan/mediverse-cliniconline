'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';

const NAV = [
  { label: 'Dashboard', href: '/dashboard/doctor', icon: '🏠' },
  { label: 'Appointments', href: '/dashboard/doctor/appointments', icon: '🗓️' },
  { label: 'My Schedule', href: '/dashboard/doctor/schedule', icon: '📅' },
  { label: 'Patients', href: '/dashboard/doctor/patients', icon: '👥' },
  { label: 'Earnings', href: '/dashboard/doctor/earnings', icon: '💰' },
  { label: 'Profile', href: '/dashboard/doctor/profile', icon: '👤' },
];

interface PatientSummary {
  patient_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  blood_group: string;
  allergies: string;
  visit_count: number;
  last_visit: string;
  last_status: string;
}

export default function DoctorPatientsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'doctor') { router.push('/auth/login'); return; }
    api.get('/appointments').then(d => {
      const appts: Record<string, unknown>[] = d.appointments || [];
      // Deduplicate by patient, collect stats
      const map = new Map<string, PatientSummary>();
      for (const a of appts) {
        const pid = a.patient_id as string;
        const existing = map.get(pid);
        if (!existing) {
          map.set(pid, {
            patient_id: pid,
            patient_name: a.patient_name as string,
            patient_email: a.patient_email as string,
            patient_phone: a.patient_phone as string,
            blood_group: a.blood_group as string,
            allergies: a.allergies as string,
            visit_count: 1,
            last_visit: a.appointment_date as string,
            last_status: a.status as string,
          });
        } else {
          existing.visit_count++;
          if (new Date(a.appointment_date as string) > new Date(existing.last_visit)) {
            existing.last_visit = a.appointment_date as string;
            existing.last_status = a.status as string;
          }
        }
      }
      setPatients(Array.from(map.values()).sort((a, b) => new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime()));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  const filtered = patients.filter(p =>
    p.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.patient_email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout navItems={NAV} role="doctor">
      <div style={{ maxWidth: '1000px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
              <span style={{ background: 'linear-gradient(135deg,#00D4E8,#0099AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Patients</span>
            </h1>
            <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>{patients.length} unique patients in your care history.</p>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ padding: '0.6rem 1rem', borderRadius: '9999px', background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(0,212,232,0.15)', color: '#F0F4FF', outline: 'none', fontSize: '0.875rem', fontFamily: 'inherit', minWidth: '240px' }} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(240,244,255,0.4)' }}>Loading patients...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(15,32,64,0.4)', borderRadius: '1.25rem', border: '1px solid rgba(0,212,232,0.08)', color: 'rgba(240,244,255,0.4)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            {search ? 'No patients match your search.' : 'No patients yet. They will appear here after confirmed appointments.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(p => (
              <div key={p.patient_id} style={{ padding: '1.25rem 1.5rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.5)', border: '1px solid rgba(0,212,232,0.1)', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#F472B644,#F472B822)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>👤</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.15rem' }}>{p.patient_name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(240,244,255,0.5)' }}>{p.patient_email} {p.patient_phone ? `· ${p.patient_phone}` : ''}</div>
                  {(p.blood_group || p.allergies) && (
                    <div style={{ fontSize: '0.72rem', marginTop: '0.2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {p.blood_group && <span style={{ color: '#C9A84C' }}>Blood: {p.blood_group}</span>}
                      {p.allergies && <span style={{ color: '#FC8181' }}>⚠️ {p.allergies}</span>}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.82rem', color: '#00D4E8', fontWeight: 500, marginBottom: '0.2rem' }}>{p.visit_count} visit{p.visit_count !== 1 ? 's' : ''}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(240,244,255,0.4)' }}>Last: {new Date(p.last_visit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
