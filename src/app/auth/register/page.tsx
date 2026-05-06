'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'patient' });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/auth/register', form);
      setAuth(data.user, data.token);
      toast.success('Account created successfully!');
      const routes: Record<string, string> = { patient: '/dashboard/patient', doctor: '/dashboard/doctor', assistant: '/dashboard/assistant' };
      router.push(routes[data.user.role] || '/dashboard/patient');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally { setLoading(false); }
  };

  const roles = [
    { value: 'patient', label: '🏥 Patient', desc: 'Book consultations' },
    { value: 'doctor', label: '🩺 Doctor', desc: 'Provide care' },
    { value: 'assistant', label: '🏠 Assistant', desc: 'Home care services' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
            <Image src="/logo.png" alt="Mediverse" width={40} height={40} style={{ borderRadius: '8px' }} />
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '1.4rem', color: '#F0F4FF' }}>Medi<span style={{ color: '#C9A84C' }}>verse</span></span>
          </Link>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2rem', color: '#F0F4FF', letterSpacing: '-1px', display: 'block' }}>Create your account</h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.875rem', marginTop: '0.4rem' }}>Join the future of global healthcare</p>
        </div>

        <div style={{ background: 'rgba(15,32,64,0.6)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '1.5rem', padding: '2rem', backdropFilter: 'blur(20px)' }}>
          <form onSubmit={submit}>
            {/* Role selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,244,255,0.6)', marginBottom: '0.75rem', fontWeight: 500 }}>I am joining as</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.6rem' }}>
                {roles.map(r => (
                  <button key={r.value} type="button" onClick={() => setForm(p => ({ ...p, role: r.value }))}
                    style={{ padding: '0.75rem 0.5rem', borderRadius: '0.75rem', border: `1px solid ${form.role === r.value ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.12)'}`, background: form.role === r.value ? 'rgba(201,168,76,0.12)' : 'rgba(10,22,40,0.5)', color: form.role === r.value ? '#E5C97A' : 'rgba(240,244,255,0.6)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', fontFamily: 'inherit' }}>
                    <div style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{r.label.split(' ')[0]}</div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600 }}>{r.label.split(' ')[1]}</div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(240,244,255,0.4)', marginTop: '0.1rem' }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {[{ label: 'Full Name', key: 'name', type: 'text', placeholder: 'Dr. John Smith' },
              { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+92-300-1234567' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' }].map(f => (
              <div key={f.key} style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,244,255,0.6)', marginBottom: '0.45rem', fontWeight: 500 }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(201,168,76,0.15)', color: '#F0F4FF', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} required />
              </div>
            ))}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', color: '#0A1628', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem', marginTop: '0.75rem', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'rgba(240,244,255,0.5)', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: 500 }}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
