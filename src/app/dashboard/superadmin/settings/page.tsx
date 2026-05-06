'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';

const NAV = [
  { label: 'Command Center', href: '/dashboard/superadmin', icon: '🛡️' },
  { label: 'User Management', href: '/dashboard/superadmin/users', icon: '👥' },
  { label: 'All Appointments', href: '/dashboard/superadmin/appointments', icon: '📅' },
  { label: 'Financials', href: '/dashboard/superadmin/financials', icon: '💰' },
  { label: 'Analytics', href: '/dashboard/superadmin/analytics', icon: '📊' },
  { label: 'System Logs', href: '/dashboard/superadmin/logs', icon: '📋' },
  { label: 'Settings', href: '/dashboard/superadmin/settings', icon: '⚙️' },
];

const SETTING_SECTIONS = [
  {
    title: 'Platform',
    color: '#C9A84C',
    items: [
      { label: 'Platform Commission Rate', value: '10%', note: 'Applied to all doctor consultation fees and assistant bookings. Change requires a deploy.' },
      { label: 'Max Appointment Advance Days', value: '30 days', note: 'How far in advance patients can book.' },
      { label: 'Slot Duration', value: '30 minutes', note: 'Fixed slot length for all doctor consultations.' },
    ],
  },
  {
    title: 'Auth & Security',
    color: '#FC8181',
    items: [
      { label: 'JWT Expiry', value: '7 days', note: 'Set via JWT_SECRET in environment variables. Change requires token rotation.' },
      { label: 'Cookie Security', value: 'httpOnly · secure · sameSite=strict', note: 'Enabled in production. Verify in Vercel deployment settings.' },
      { label: 'DB Connection Pool', value: 'max: 1 (serverless)', note: 'Optimized for Vercel edge functions + Neon HTTP driver.' },
    ],
  },
  {
    title: 'Integrations',
    color: '#00D4E8',
    items: [
      { label: 'Database', value: 'Neon (PostgreSQL)', note: 'Connected via DATABASE_URL environment variable.' },
      { label: 'Deployment', value: 'Vercel', note: 'Set environment variables under Project → Settings → Environment Variables.' },
      { label: 'Email / SMS', value: 'Not configured', note: 'Add an email provider (Resend, SendGrid) to enable appointment confirmations.' },
      { label: 'Payment Gateway', value: 'Not configured', note: 'Integrate JazzCash, Easypaisa, or Stripe for real payment processing.' },
    ],
  },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (!user || !['superadmin'].includes(user.role)) router.push('/auth/login');
  }, [user, router]);

  return (
    <DashboardLayout navItems={NAV} role="superadmin">
      <div style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            <span style={{ background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Settings</span>
          </h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Platform configuration reference. Most values are set via environment variables.</p>
        </div>

        <div style={{ padding: '1rem 1.5rem', borderRadius: '0.875rem', background: 'rgba(0,212,232,0.06)', border: '1px solid rgba(0,212,232,0.2)', marginBottom: '2rem', fontSize: '0.82rem', color: '#00D4E8' }}>
          ℹ️ These are read-only configuration references. To change values, update the relevant environment variable in Vercel and redeploy, or modify the source code.
        </div>

        {SETTING_SECTIONS.map(section => (
          <div key={section.title} style={{ background: 'rgba(15,32,64,0.4)', border: `1px solid rgba(${section.color === '#C9A84C' ? '201,168,76' : section.color === '#FC8181' ? '239,68,68' : '0,212,232'},0.12)`, borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: section.color, marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{section.title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {section.items.map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', padding: '0.875rem', borderRadius: '0.75rem', background: 'rgba(10,22,40,0.4)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>{item.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'rgba(240,244,255,0.4)' }}>{item.note}</div>
                  </div>
                  <div style={{ flexShrink: 0, padding: '0.3rem 0.85rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.78rem', color: section.color, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
