'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.role === 'superadmin') router.push('/dashboard/superadmin');
    else router.push('/dashboard/superadmin');
  }, [user, router]);
  return null;
}
