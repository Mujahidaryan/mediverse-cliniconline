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

interface Assistant {
  id: string; name: string; skills: string[]; experience_years: number;
  rating: number; total_reviews: number; hourly_rate: number; daily_rate: number;
  location: string; is_available: boolean; bio: string;
}

export default function AssistantsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selected, setSelected] = useState<Assistant | null>(null);
  const [form, setForm] = useState({ start_date: '', end_date: '', service_type: '', hours_per_day: 8, address: '', notes: '' });
  const [booking, setBooking] = useState(false);
  const [skillFilter, setSkillFilter] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'patient') { router.push('/auth/login'); return; }
    const params = skillFilter ? `?skill=${skillFilter}` : '';
    api.get(`/assistants${params}`).then(d => setAssistants(d.assistants || [])).catch(() => {});
  }, [user, router, skillFilter]);

  const submitBooking = async () => {
    if (!selected || !form.start_date || !form.service_type) { toast.error('Please fill all required fields'); return; }
    setBooking(true);
    try {
      await api.post('/assistants', { assistant_id: selected.id, ...form });
      toast.success('Home assistant request submitted!');
      setSelected(null);
      setForm({ start_date: '', end_date: '', service_type: '', hours_per_day: 8, address: '', notes: '' });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Booking failed');
    } finally { setBooking(false); }
  };

  const allSkills = Array.from(new Set(assistants.flatMap(a => a.skills)));

  return (
    <DashboardLayout navItems={NAV} role="patient">
      <div style={{ maxWidth: '1100px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            <span style={{ background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Home Medical Assistants</span>
          </h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Certified care professionals available at your doorstep.</p>
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
          <button onClick={() => setSkillFilter('')} style={{ padding: '0.45rem 1rem', borderRadius: '9999px', border: `1px solid ${!skillFilter ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.15)'}`, background: !skillFilter ? 'rgba(201,168,76,0.12)' : 'none', color: !skillFilter ? '#E5C97A' : 'rgba(240,244,255,0.6)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>All Skills</button>
          {allSkills.map(skill => (
            <button key={skill} onClick={() => setSkillFilter(skill)} style={{ padding: '0.45rem 1rem', borderRadius: '9999px', border: `1px solid ${skillFilter === skill ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.15)'}`, background: skillFilter === skill ? 'rgba(201,168,76,0.12)' : 'none', color: skillFilter === skill ? '#E5C97A' : 'rgba(240,244,255,0.6)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>{skill}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '1.5rem' }}>
          {/* Assistants grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.25rem', alignContent: 'start' }}>
            {assistants.map(a => (
              <div key={a.id} style={{ padding: '1.5rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.55)', border: `1px solid ${selected?.id === a.id ? 'rgba(74,222,128,0.4)' : 'rgba(201,168,76,0.12)'}`, transition: 'all 0.3s', cursor: 'pointer' }} onClick={() => setSelected(selected?.id === a.id ? null : a)}>
                <div style={{ display: 'flex', gap: '0.875rem', marginBottom: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#4ADE8044,#4ADE8022)', border: '2px solid #4ADE8030', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🧑‍⚕️</div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{a.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(240,244,255,0.5)' }}>{a.location}</div>
                    <div style={{ fontSize: '0.8rem', color: '#C9A84C', marginTop: '0.1rem' }}>⭐ {Number(a.rating).toFixed(1)} ({a.total_reviews})</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                  {a.skills.map(s => <span key={s} style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ADE80', fontSize: '0.68rem' }}>{s}</span>)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(240,244,255,0.4)' }}>Daily Rate</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#C9A84C' }}>PKR {Number(a.daily_rate).toLocaleString()}</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', borderRadius: '9999px', background: a.is_available ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: a.is_available ? '#4ADE80' : '#FC8181' }}>{a.is_available ? 'Available' : 'Busy'}</div>
                </div>
                <button style={{ width: '100%', marginTop: '0.875rem', padding: '0.6rem', borderRadius: '9999px', background: selected?.id === a.id ? 'linear-gradient(135deg,#4ADE80,#22C55E)' : 'linear-gradient(135deg,#E5C97A,#C9A84C)', color: '#0A1628', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit' }}>
                  {selected?.id === a.id ? '✓ Selected' : 'Book Assistant'}
                </button>
              </div>
            ))}
            {assistants.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'rgba(240,244,255,0.4)' }}>No assistants found for selected skill.</div>}
          </div>

          {/* Booking form panel */}
          {selected && (
            <div style={{ background: 'rgba(15,32,64,0.6)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '1.5rem', padding: '1.75rem', height: 'fit-content', position: 'sticky', top: '1rem' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '1.3rem', marginBottom: '1.25rem', color: '#F0F4FF' }}>Book {selected.name}</h3>
              {[
                { label: 'Start Date *', key: 'start_date', type: 'date' },
                { label: 'End Date', key: 'end_date', type: 'date' },
                { label: 'Service Type *', key: 'service_type', type: 'text', placeholder: 'e.g. Nursing, Elderly Care' },
                { label: 'Your Address *', key: 'address', type: 'text', placeholder: 'Full home address' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(240,244,255,0.55)', marginBottom: '0.4rem' }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={form[f.key as keyof typeof form] as string}
                    min={f.type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem 0.875rem', borderRadius: '0.6rem', background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(201,168,76,0.15)', color: '#F0F4FF', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit' }} />
                </div>
              ))}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(240,244,255,0.55)', marginBottom: '0.4rem' }}>Hours per Day</label>
                <select value={form.hours_per_day} onChange={e => setForm(p => ({ ...p, hours_per_day: parseInt(e.target.value) }))} style={{ width: '100%', padding: '0.65rem 0.875rem', borderRadius: '0.6rem', background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(201,168,76,0.15)', color: '#F0F4FF', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
                  {[4,6,8,10,12].map(h => <option key={h} value={h}>{h} hours</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(240,244,255,0.55)', marginBottom: '0.4rem' }}>Additional Notes</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any special requirements..."
                  style={{ width: '100%', padding: '0.65rem 0.875rem', borderRadius: '0.6rem', background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(201,168,76,0.15)', color: '#F0F4FF', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: '80px' }} />
              </div>
              {form.start_date && (
                <div style={{ padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(240,244,255,0.5)', marginBottom: '0.3rem' }}>Estimated Cost</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#C9A84C' }}>
                    PKR {(Number(selected.daily_rate) * (form.end_date ? Math.max(1, Math.ceil((new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) / 86400000) + 1) : 1)).toLocaleString()}
                  </div>
                </div>
              )}
              <button onClick={submitBooking} disabled={booking}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#4ADE80,#22C55E)', color: '#0A1628', border: 'none', cursor: booking ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit', opacity: booking ? 0.7 : 1 }}>
                {booking ? 'Submitting...' : 'Submit Booking Request'}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
