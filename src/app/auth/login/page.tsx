'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const DEMO = [
    { label: 'Super Admin', email: 'superadmin@mediverse.com', pw: 'Admin@123', color: '#C9A84C' },
    { label: 'Admin', email: 'admin@mediverse.com', pw: 'Admin@123', color: '#A5B4FC' },
    { label: 'Patient', email: 'patient@mediverse.com', pw: 'Patient@123', color: '#4ADE80' },
    { label: 'Doctor', email: 'zara@mediverse.com', pw: 'Doctor@123', color: '#00D4E8' },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/auth/login', form);
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}`);
      const routes: Record<string, string> = {
        superadmin: '/dashboard/superadmin',
        admin: '/dashboard/admin',
        doctor: '/dashboard/doctor',
        assistant: '/dashboard/assistant',
        patient: '/dashboard/patient',
      };
      router.push(routes[data.user.role] || '/dashboard/patient');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', marginBottom: '2rem' }}>
            <Image src="/logo.png" alt="Mediverse" width={44} height={44} style={{ borderRadius: '10px' }} />
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '1.5rem', color: '#F0F4FF' }}>Medi<span style={{ color: '#C9A84C' }}>verse</span></span>
          </Link>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2rem', color: '#F0F4FF', letterSpacing: '-1px', display: 'block' }}>Welcome back</h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.875rem', marginTop: '0.4rem' }}>Sign in to your Mediverse account</p>
        </div>

        <div style={{ background: 'rgba(15,32,64,0.6)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '1.5rem', padding: '2rem', backdropFilter: 'blur(20px)', marginBottom: '1.5rem' }}>
          <form onSubmit={submit}>
            {[{ label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' }].map(f => (
              <div key={f.key} style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,244,255,0.6)', marginBottom: '0.5rem', fontWeight: 500 }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(201,168,76,0.15)', color: '#F0F4FF', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} required />
              </div>
            ))}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', color: '#0A1628', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo Logins */}
        <div style={{ background: 'rgba(15,32,64,0.4)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '1.25rem', padding: '1.25rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'rgba(240,244,255,0.4)', textAlign: 'center', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Demo Access</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {DEMO.map(d => (
              <button key={d.label} onClick={() => { setForm({ email: d.email, password: d.pw }); }}
                style={{ padding: '0.6rem', borderRadius: '0.6rem', background: 'rgba(10,22,40,0.5)', border: `1px solid ${d.color}30`, color: d.color, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, transition: 'all 0.2s' }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'rgba(240,244,255,0.5)', marginTop: '1.5rem' }}>
          No account?{' '}
          <Link href="/auth/register" style={{ color: '#C9A84C', textDecoration: 'none', fontWeight: 500 }}>Create one →</Link>
        </p>
      </div>
    </div>
  );
}
