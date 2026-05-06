'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface NavItem { label: string; href: string; icon: string; }

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  role: string;
}

export default function DashboardLayout({ children, navItems, role }: DashboardLayoutProps) {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [notifCount, setNotifCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }
    api.get('/notifications').then(d => {
      setNotifCount(d.notifications.filter((n: { is_read: boolean }) => !n.is_read).length);
    }).catch(() => {});
  }, [user, router]);

  const logout = () => {
    clearAuth();
    document.cookie = 'mediverse_token=; Max-Age=0; path=/';
    router.push('/auth/login');
    toast.success('Signed out');
  };

  const roleColors: Record<string, string> = {
    superadmin: '#C9A84C', admin: '#A5B4FC', doctor: '#00D4E8', assistant: '#4ADE80', patient: '#F472B6'
  };
  const color = roleColors[role] || '#C9A84C';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A1628', fontFamily: "'DM Sans',sans-serif", color: '#F0F4FF' }}>
      {/* SIDEBAR */}
      {/* Mobile overlay backdrop */}
      {isMobile && sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49, background: 'rgba(0,0,0,0.5)' }} />}
      <aside style={{ width: sidebarOpen ? '260px' : (isMobile ? '0px' : '72px'), minHeight: '100vh', background: '#060E1A', borderRight: '1px solid rgba(201,168,76,0.1)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s', position: isMobile ? 'fixed' : 'sticky', top: 0, height: '100vh', overflow: 'hidden', flexShrink: 0, zIndex: isMobile ? 50 : 1 }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1rem', borderBottom: '1px solid rgba(201,168,76,0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem', minHeight: '72px' }}>
          <Image src="/logo.png" alt="Mediverse" width={36} height={36} style={{ borderRadius: '8px', flexShrink: 0 }} />
          {sidebarOpen && <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '1.25rem', whiteSpace: 'nowrap' }}>Medi<span style={{ color: '#C9A84C' }}>verse</span></span>}
        </div>

        {/* Role badge */}
        {sidebarOpen && (
          <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
            <div style={{ padding: '0.5rem 0.875rem', borderRadius: '0.6rem', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}` }} />
              <span style={{ fontSize: '0.75rem', color, fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{role}</span>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem', marginBottom: '0.25rem', color: active ? color : 'rgba(240,244,255,0.55)', background: active ? `${color}12` : 'transparent', border: active ? `1px solid ${color}25` : '1px solid transparent', textDecoration: 'none', transition: 'all 0.2s', fontSize: '0.875rem', fontWeight: active ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(201,168,76,0.08)' }}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg,${color},${color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#0A1628', flexShrink: 0 }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                <button onClick={logout} style={{ fontSize: '0.72rem', color: 'rgba(240,244,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Sign out</button>
              </div>
            </div>
          ) : (
            <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,244,255,0.4)', fontSize: '1.1rem', width: '100%', textAlign: 'center' }} title="Sign out">⏻</button>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Topbar */}
        <header style={{ height: '72px', borderBottom: '1px solid rgba(201,168,76,0.08)', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6,14,26,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'rgba(240,244,255,0.5)', cursor: 'pointer', fontSize: '1.2rem', padding: '0.5rem' }}>☰</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,244,255,0.6)', fontSize: '1.1rem' }}>
              🔔
              {notifCount > 0 && <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '16px', height: '16px', borderRadius: '50%', background: '#C9A84C', color: '#0A1628', fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notifCount}</span>}
            </button>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg,${color},${color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#0A1628' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: isMobile ? '1.25rem' : '2rem', overflowY: 'auto', minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
