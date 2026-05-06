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

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', gender: '', blood_group: '', allergies: '', chronic_conditions: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'patient') { router.push('/auth/login'); return; }
    api.get('/auth/me').then(d => {
      const u = d.user;
      setForm(p => ({ ...p, name: u.name ?? '', email: u.email ?? '', phone: u.phone ?? '' }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await api.patch('/auth/profile', form);
      if (data.user && token) setAuth(data.user, token);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const inp: React.CSSProperties = { width: '100%', padding: '0.7rem 0.9rem', borderRadius: '0.6rem', background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(201,168,76,0.15)', color: '#F0F4FF', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '0.78rem', color: 'rgba(240,244,255,0.55)', marginBottom: '0.45rem', fontWeight: 500 };

  // Form renders immediately with empty defaults

  return (
    <DashboardLayout navItems={NAV} role="patient">
      <div style={{ maxWidth: '700px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            <span style={{ background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Profile</span>
          </h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Manage your personal and medical information.</p>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.5)', border: '1px solid rgba(201,168,76,0.12)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#F472B6,#EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700, color: '#0A1628' }}>{user?.name?.charAt(0) || 'P'}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{user?.name}</div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(240,244,255,0.5)', marginBottom: '0.5rem' }}>{user?.email}</div>
            <span style={{ padding: '0.2rem 0.75rem', borderRadius: '9999px', background: 'rgba(244,114,182,0.12)', border: '1px solid rgba(244,114,182,0.25)', color: '#F472B6', fontSize: '0.72rem', fontWeight: 500 }}>Patient</span>
          </div>
        </div>

        <form onSubmit={save}>
          <div style={{ background: 'rgba(15,32,64,0.5)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#C9A84C', marginBottom: '1.25rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[{label:'Full Name',key:'name',type:'text'},{label:'Email',key:'email',type:'email'},{label:'Phone',key:'phone',type:'tel'}].map(f => (
                <div key={f.key}>
                  <label style={lbl}>{f.label}</label>
                  <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))} style={inp} disabled={f.key==='email'} />
                </div>
              ))}
              <div style={{ gridColumn: '1/-1' }}>
                <label style={lbl}>Address</label>
                <input type="text" value={form.address} onChange={e => setForm(p=>({...p,address:e.target.value}))} style={inp} />
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(15,32,64,0.5)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#C9A84C', marginBottom: '1.25rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Medical Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={lbl}>Gender</label>
                <select value={form.gender} onChange={e => setForm(p=>({...p,gender:e.target.value}))} style={{...inp,cursor:'pointer'}}>
                  <option value="">Select</option>
                  {['Male','Female','Other','Prefer not to say'].map(g=><option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Blood Group</label>
                <select value={form.blood_group} onChange={e => setForm(p=>({...p,blood_group:e.target.value}))} style={{...inp,cursor:'pointer'}}>
                  <option value="">Select</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b=><option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              {[{label:'Known Allergies',key:'allergies',ph:'e.g. Penicillin, Peanuts'},{label:'Chronic Conditions',key:'chronic_conditions',ph:'e.g. Diabetes, Hypertension'}].map(f=>(
                <div key={f.key} style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>{f.label}</label>
                  <input type="text" placeholder={f.ph} value={form[f.key as keyof typeof form]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} style={inp} />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ padding: '0.85rem 2.5rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', color: '#0A1628', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
