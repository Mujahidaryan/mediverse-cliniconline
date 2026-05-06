'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';

const NAV = [
  { label: 'Dashboard', href: '/dashboard/assistant', icon: '🏠' },
  { label: 'Job Requests', href: '/dashboard/assistant/jobs', icon: '📋' },
  { label: 'My Schedule', href: '/dashboard/assistant/schedule', icon: '📅' },
  { label: 'Earnings', href: '/dashboard/assistant/earnings', icon: '💰' },
  { label: 'Profile', href: '/dashboard/assistant/profile', icon: '👤' },
];

export default function AssistantEarningsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  useEffect(() => { if (!user || user.role !== 'assistant') router.push('/auth/login'); }, [user, router]);

  return (
    <DashboardLayout navItems={NAV} role="assistant">
      <div style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            <span style={{ background: 'linear-gradient(135deg,#4ADE80,#22C55E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Earnings</span>
          </h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Platform commission is 10% on all completed assignments.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
          <StatCard label="Gross Revenue" value="PKR 0" icon="💰" color="#C9A84C" />
          <StatCard label="Platform Fee (10%)" value="PKR 0" icon="🏦" color="#FC8181" />
          <StatCard label="Net Earnings" value="PKR 0" icon="✅" color="#4ADE80" />
          <StatCard label="Pending Payout" value="PKR 0" icon="⏳" color="#FBD34D" />
        </div>
        <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(15,32,64,0.4)', borderRadius: '1.25rem', border: '1px solid rgba(74,222,128,0.1)', color: 'rgba(240,244,255,0.4)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💼</div>
          <div>No completed assignments yet. Earnings will appear here once jobs are marked complete.</div>
        </div>
      </div>
    </DashboardLayout>
  );
}
