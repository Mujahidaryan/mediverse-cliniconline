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

const SPECIALIZATIONS = ['General Physician','Cardiologist','Neurologist','Dermatologist','Orthopedic','Pediatrician','Gynecologist','Psychiatrist','Nephrologist'];

export default function DoctorProfilePage() {
  const { user, setAuth, token } = useAuthStore();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', phone: '', specialization: 'General Physician', qualification: '',
    experience_years: '', consultation_fee: '', hospital: '', location: '', bio: '', license_number: '',
  });
  const [loading, setLoading] = useState(false); // start false - form renders with empty defaults
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'doctor') { router.push('/auth/login'); return; }
    Promise.all([api.get('/auth/me'), api.get('/doctors')])
      .then(([me, docs]) => {
        const u = me.user;
        const myDoc = docs.doctors?.find((d: Record<string, unknown>) => d.user_id === u.id);
        setForm({
          name: u.name ?? '',
          phone: u.phone ?? '',
          specialization: myDoc?.specialization ?? 'General Physician',
          qualification: myDoc?.qualification ?? '',
          experience_years: myDoc?.experience_years?.toString() ?? '',
          consultation_fee: myDoc?.consultation_fee?.toString() ?? '',
          hospital: myDoc?.hospital ?? '',
          location: myDoc?.location ?? '',
          bio: myDoc?.bio ?? '',
          license_number: myDoc?.license_number ?? '',
        });
      })
      .catch(() => {}) // Non-critical - form still usable with empty defaults
      .finally(() => setLoading(false));
    // Fallback: exit loading after 5s even if API is slow
    const fallback = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(fallback);
  }, [user, router]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await api.patch('/auth/profile', {
        ...form,
        experience_years: parseInt(form.experience_years) || 0,
        consultation_fee: parseFloat(form.consultation_fee) || 0,
      });
      if (data.user && token) setAuth(data.user, token);
      toast.success('Profile saved successfully!');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const inp: React.CSSProperties = { width: '100%', padding: '0.7rem 0.9rem', borderRadius: '0.6rem', background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(0,212,232,0.15)', color: '#F0F4FF', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '0.78rem', color: 'rgba(240,244,255,0.55)', marginBottom: '0.45rem', fontWeight: 500 };

  // No full page loading gate - form renders immediately with defaults, populates when API responds

  return (
    <DashboardLayout navItems={NAV} role="doctor">
      <div style={{ maxWidth: '700px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            <span style={{ background: 'linear-gradient(135deg,#00D4E8,#0099AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Doctor Profile</span>
          </h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Keep your professional information up to date.</p>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.5)', border: '1px solid rgba(0,212,232,0.15)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#00D4E8,#0099AA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', color: '#0A1628', fontWeight: 700 }}>{user?.name?.charAt(0)}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{user?.name}</div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(240,244,255,0.5)', marginBottom: '0.5rem' }}>{user?.email}</div>
            <span style={{ padding: '0.2rem 0.75rem', borderRadius: '9999px', background: 'rgba(0,212,232,0.1)', border: '1px solid rgba(0,212,232,0.25)', color: '#00D4E8', fontSize: '0.72rem', fontWeight: 500 }}>Doctor</span>
          </div>
        </div>

        <form onSubmit={save}>
          <div style={{ background: 'rgba(15,32,64,0.5)', border: '1px solid rgba(0,212,232,0.12)', borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#C9A84C', marginBottom: '1.25rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Account</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label style={lbl}>Full Name</label><input type="text" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} style={inp} required /></div>
              <div><label style={lbl}>Phone</label><input type="tel" value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))} style={inp} /></div>
            </div>
          </div>

          <div style={{ background: 'rgba(15,32,64,0.5)', border: '1px solid rgba(0,212,232,0.12)', borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#00D4E8', marginBottom: '1.25rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Professional Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={lbl}>Specialization</label>
                <select value={form.specialization} onChange={e => setForm(p=>({...p,specialization:e.target.value}))} style={{...inp,cursor:'pointer'}}>
                  {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {[
                {label:'Qualification',key:'qualification',ph:'MBBS, FCPS (Cardiology)'},
                {label:'Years of Experience',key:'experience_years',ph:'10'},
                {label:'Consultation Fee (PKR)',key:'consultation_fee',ph:'2500'},
                {label:'Hospital / Clinic',key:'hospital',ph:'Aga Khan Hospital'},
                {label:'City / Location',key:'location',ph:'Karachi'},
                {label:'License Number',key:'license_number',ph:'PMDC-12345'},
              ].map(f => (
                <div key={f.key}>
                  <label style={lbl}>{f.label}</label>
                  <input type="text" placeholder={f.ph} value={form[f.key as keyof typeof form]} onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))} style={inp} />
                </div>
              ))}
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Professional Bio</label>
                <textarea value={form.bio} onChange={e => setForm(p=>({...p,bio:e.target.value}))} placeholder="Brief professional biography for patients..."
                  style={{...inp,resize:'vertical',minHeight:'100px'}} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ padding: '0.85rem 2.5rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#00D4E8,#0099AA)', color: '#0A1628', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
