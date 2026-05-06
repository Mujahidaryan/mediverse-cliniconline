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

export default function AssistantJobsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  useEffect(() => { if (!user || user.role !== 'assistant') router.push('/auth/login'); }, [user, router]);

  return (
    <DashboardLayout navItems={NAV} role="assistant">
      <div style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            <span style={{ background: 'linear-gradient(135deg,#4ADE80,#22C55E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Job Requests</span>
          </h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Incoming requests from patients requiring home care.</p>
        </div>
        <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(15,32,64,0.4)', borderRadius: '1.25rem', border: '1px solid rgba(74,222,128,0.1)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <div style={{ fontWeight: 500, marginBottom: '0.5rem', color: '#F0F4FF' }}>No job requests yet</div>
          <div style={{ fontSize: '0.875rem', color: 'rgba(240,244,255,0.45)', maxWidth: '360px', margin: '0 auto' }}>
            Complete your profile and wait for admin approval. Once approved, patient requests will appear here.
          </div>
          <button onClick={() => router.push('/dashboard/assistant/profile')} style={{ marginTop: '1.5rem', padding: '0.65rem 1.75rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#4ADE80,#22C55E)', color: '#0A1628', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>Complete Profile →</button>
        </div>
      </div>
    </DashboardLayout>
  );
}
