'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { api } from '@/lib/api';

const NAV = [
  { label: 'Dashboard', href: '/dashboard/assistant', icon: '🏠' },
  { label: 'Job Requests', href: '/dashboard/assistant/jobs', icon: '📋' },
  { label: 'My Schedule', href: '/dashboard/assistant/schedule', icon: '📅' },
  { label: 'Earnings', href: '/dashboard/assistant/earnings', icon: '💰' },
  { label: 'Profile', href: '/dashboard/assistant/profile', icon: '👤' },
];

export default function AssistantDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'assistant') { router.push('/auth/login'); return; }
    // For now show basic dashboard - bookings API can be extended
    setProfile({ name: user.name, status: 'Pending Approval' });
  }, [user, router]);

  return (
    <DashboardLayout navItems={NAV} role="assistant">
      <div style={{ maxWidth: '1000px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            Welcome, <span style={{ background: 'linear-gradient(135deg,#4ADE80,#22C55E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name?.split(' ')[0]}</span>
          </h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Your home care assistant dashboard.</p>
        </div>

        {/* Approval notice */}
        <div style={{ padding: '1.25rem 1.5rem', borderRadius: '1rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '1.5rem' }}>⏳</span>
          <div>
            <div style={{ fontWeight: 500, color: '#FBD34D', marginBottom: '0.25rem' }}>Profile Under Review</div>
            <div style={{ fontSize: '0.82rem', color: 'rgba(240,244,255,0.55)' }}>Your profile is being reviewed by our admin team. You&apos;ll receive a notification once approved.</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
          <StatCard label="Job Requests" value={0} icon="📋" color="#4ADE80" />
          <StatCard label="Active Jobs" value={0} icon="✅" color="#00D4E8" />
          <StatCard label="Completed" value={0} icon="🏆" color="#C9A84C" />
          <StatCard label="Total Earned" value="PKR 0" icon="💰" color="#F472B6" />
        </div>

        {/* Profile setup prompt */}
        <div style={{ padding: '2rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.5)', border: '1px solid rgba(74,222,128,0.15)', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏠</div>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '1.5rem', marginBottom: '0.75rem' }}>Complete Your Profile</h3>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>Add your skills, certifications, and availability to start receiving job requests from patients.</p>
          <button onClick={() => router.push('/dashboard/assistant/profile')} style={{ padding: '0.75rem 2rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#4ADE80,#22C55E)', color: '#0A1628', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'inherit' }}>
            Set Up Profile →
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
