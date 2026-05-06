'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const NAV = [
  { label: 'Dashboard', href: '/dashboard/assistant', icon: '🏠' },
  { label: 'Job Requests', href: '/dashboard/assistant/jobs', icon: '📋' },
  { label: 'My Schedule', href: '/dashboard/assistant/schedule', icon: '📅' },
  { label: 'Earnings', href: '/dashboard/assistant/earnings', icon: '💰' },
  { label: 'Profile', href: '/dashboard/assistant/profile', icon: '👤' },
];

const SKILL_OPTIONS = ['Nursing','Elderly Care','Wound Dressing','Physiotherapy','Post-Surgery Care','Pediatric Care','Medication Management','Patient Transport','Mental Health Support'];

export default function AssistantProfilePage() {
  const { user, setAuth, token } = useAuthStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', skills: [] as string[], experience_years: '', hourly_rate: '', daily_rate: '', location: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'assistant') { router.push('/auth/login'); return; }
    api.get('/auth/me').then(d => {
      const u = d.user;
      setForm(p => ({ ...p, name: u.name ?? '', phone: u.phone ?? '' }));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  const toggleSkill = (skill: string) => {
    setForm(p => ({ ...p, skills: p.skills.includes(skill) ? p.skills.filter(s => s !== skill) : [...p.skills, skill] }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await api.patch('/auth/profile', { ...form, experience_years: parseInt(form.experience_years) || 0, hourly_rate: parseFloat(form.hourly_rate) || 0, daily_rate: parseFloat(form.daily_rate) || 0 });
      if (data.user && token) setAuth(data.user, token);
      toast.success('Profile saved! Awaiting admin approval.');
    } catch { toast.error('Failed to save profile'); } finally { setSaving(false); }
  };

  const inp: React.CSSProperties = { width: '100%', padding: '0.7rem 0.9rem', borderRadius: '0.6rem', background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(74,222,128,0.15)', color: '#F0F4FF', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '0.78rem', color: 'rgba(240,244,255,0.55)', marginBottom: '0.45rem', fontWeight: 500 };

  if (loading) return <DashboardLayout navItems={NAV} role="assistant"><div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(240,244,255,0.4)' }}>Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout navItems={NAV} role="assistant">
      <div style={{ maxWidth: '700px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            <span style={{ background: 'linear-gradient(135deg,#4ADE80,#22C55E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Profile</span>
          </h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Complete your profile to start receiving job requests.</p>
        </div>
        <form onSubmit={save}>
          <div style={{ background: 'rgba(15,32,64,0.5)', border: '1px solid rgba(74,222,128,0.12)', borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4ADE80', marginBottom: '1.25rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Basic Info</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label style={lbl}>Full Name</label><input type="text" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={inp} required /></div>
              <div><label style={lbl}>Phone</label><input type="tel" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} style={inp} /></div>
              <div><label style={lbl}>City / Location</label><input type="text" placeholder="Karachi" value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))} style={inp} /></div>
              <div><label style={lbl}>Years of Experience</label><input type="number" placeholder="5" value={form.experience_years} onChange={e=>setForm(p=>({...p,experience_years:e.target.value}))} style={inp} /></div>
              <div><label style={lbl}>Hourly Rate (PKR)</label><input type="number" placeholder="150" value={form.hourly_rate} onChange={e=>setForm(p=>({...p,hourly_rate:e.target.value}))} style={inp} /></div>
              <div><label style={lbl}>Daily Rate (PKR)</label><input type="number" placeholder="800" value={form.daily_rate} onChange={e=>setForm(p=>({...p,daily_rate:e.target.value}))} style={inp} /></div>
              <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Bio</label><textarea value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))} placeholder="Describe your experience and approach to patient care..." style={{...inp,resize:'vertical',minHeight:'90px'}} /></div>
            </div>
          </div>
          <div style={{ background: 'rgba(15,32,64,0.5)', border: '1px solid rgba(74,222,128,0.12)', borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4ADE80', marginBottom: '1.25rem', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {SKILL_OPTIONS.map(skill => {
                const sel = form.skills.includes(skill);
                return (
                  <button key={skill} type="button" onClick={() => toggleSkill(skill)} style={{ padding: '0.45rem 1rem', borderRadius: '9999px', border: `1px solid ${sel ? 'rgba(74,222,128,0.5)' : 'rgba(74,222,128,0.15)'}`, background: sel ? 'rgba(74,222,128,0.12)' : 'none', color: sel ? '#4ADE80' : 'rgba(240,244,255,0.6)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>
                    {sel ? '✓ ' : ''}{skill}
                  </button>
                );
              })}
            </div>
          </div>
          <button type="submit" disabled={saving} style={{ padding: '0.85rem 2.5rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#4ADE80,#22C55E)', color: '#0A1628', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
