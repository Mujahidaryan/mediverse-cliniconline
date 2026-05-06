'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';

const NAV = [
  { label: 'Dashboard', href: '/dashboard/assistant', icon: '🏠' },
  { label: 'Job Requests', href: '/dashboard/assistant/jobs', icon: '📋' },
  { label: 'My Schedule', href: '/dashboard/assistant/schedule', icon: '📅' },
  { label: 'Earnings', href: '/dashboard/assistant/earnings', icon: '💰' },
  { label: 'Profile', href: '/dashboard/assistant/profile', icon: '👤' },
];

export default function AssistantSchedulePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  useEffect(() => { if (!user || user.role !== 'assistant') router.push('/auth/login'); }, [user, router]);

  return (
    <DashboardLayout navItems={NAV} role="assistant">
      <div style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            <span style={{ background: 'linear-gradient(135deg,#4ADE80,#22C55E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Schedule</span>
          </h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Your active and upcoming home care assignments.</p>
        </div>
        <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(15,32,64,0.4)', borderRadius: '1.25rem', border: '1px solid rgba(74,222,128,0.1)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <div style={{ fontWeight: 500, marginBottom: '0.5rem', color: '#F0F4FF' }}>No active assignments</div>
          <div style={{ fontSize: '0.875rem', color: 'rgba(240,244,255,0.45)' }}>Approved job requests will appear here as scheduled assignments.</div>
        </div>
      </div>
    </DashboardLayout>
  );
}
