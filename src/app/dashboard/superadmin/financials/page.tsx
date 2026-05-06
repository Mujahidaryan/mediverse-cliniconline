'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const NAV = [
  { label: 'Command Center', href: '/dashboard/superadmin', icon: '🛡️' },
  { label: 'User Management', href: '/dashboard/superadmin/users', icon: '👥' },
  { label: 'All Appointments', href: '/dashboard/superadmin/appointments', icon: '📅' },
  { label: 'Financials', href: '/dashboard/superadmin/financials', icon: '💰' },
  { label: 'Analytics', href: '/dashboard/superadmin/analytics', icon: '📊' },
  { label: 'System Logs', href: '/dashboard/superadmin/logs', icon: '📋' },
  { label: 'Settings', href: '/dashboard/superadmin/settings', icon: '⚙️' },
];

export default function FinancialsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !['superadmin', 'admin'].includes(user.role)) { router.push('/auth/login'); return; }
    Promise.all([api.get('/admin/stats'), api.get('/payments')])
      .then(([s, p]) => { setStats(s); setPayments(p.payments || []); })
      .catch(() => toast.error('Failed to load financials'))
      .finally(() => setLoading(false));
  }, [user, router]);

  const total = parseFloat((stats?.payments as Record<string, string>)?.total || '0');
  const commission = parseFloat((stats?.payments as Record<string, string>)?.commission || '0');
  const netToProviders = total - commission;

  const monthlyRevenue = ((stats?.revenueByMonth as Record<string, string>[]) || []);
  const maxRev = Math.max(...monthlyRevenue.map(m => parseFloat(m.total) || 0), 1);

  return (
    <DashboardLayout navItems={NAV} role={user?.role || 'superadmin'}>
      <div style={{ maxWidth: '1100px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            <span style={{ background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Financials</span>
          </h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Platform revenue, commission, and payout summary.</p>
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(240,244,255,0.4)' }}>Loading financials...</div> : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
              <StatCard label="Gross Revenue" value={`PKR ${(total/1000).toFixed(1)}K`} icon="💰" color="#C9A84C" />
              <StatCard label="Platform Commission (10%)" value={`PKR ${(commission/1000).toFixed(1)}K`} icon="🏦" color="#A5B4FC" />
              <StatCard label="Net to Providers" value={`PKR ${(netToProviders/1000).toFixed(1)}K`} icon="✅" color="#4ADE80" />
              <StatCard label="Total Transactions" value={payments.length} icon="🧾" color="#00D4E8" />
            </div>

            {/* Monthly chart */}
            {monthlyRevenue.length > 0 && (
              <div style={{ padding: '1.75rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.4)', border: '1px solid rgba(201,168,76,0.12)', marginBottom: '1.75rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', color: 'rgba(240,244,255,0.8)' }}>Monthly Revenue</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '160px' }}>
                  {monthlyRevenue.map(m => {
                    const h = Math.max((parseFloat(m.total) / maxRev) * 100, 4);
                    const label = new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    return (
                      <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(240,244,255,0.5)' }}>PKR {(parseFloat(m.total)/1000).toFixed(0)}K</div>
                        <div style={{ width: '100%', height: `${h}%`, borderRadius: '4px 4px 0 0', background: 'linear-gradient(to top,#C9A84C,#E5C97A)', minHeight: '6px' }} />
                        <div style={{ fontSize: '0.65rem', color: 'rgba(240,244,255,0.4)', whiteSpace: 'nowrap' }}>{label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payments table */}
            <div style={{ background: 'rgba(15,32,64,0.4)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '1.25rem', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(201,168,76,0.1)', fontSize: '0.9rem', fontWeight: 600 }}>Transaction Log</div>
              {payments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(240,244,255,0.4)' }}>No transactions yet.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(10,22,40,0.4)' }}>
                        {['Transaction ID', 'Amount', 'Commission', 'Net', 'Method', 'Status', 'Date'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '0.875rem 1.25rem', color: 'rgba(240,244,255,0.4)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id as string} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.78rem', color: 'rgba(240,244,255,0.5)', fontFamily: 'monospace' }}>{p.transaction_id as string}</td>
                          <td style={{ padding: '0.875rem 1.25rem', color: '#C9A84C', fontWeight: 500 }}>PKR {Number(p.amount).toLocaleString()}</td>
                          <td style={{ padding: '0.875rem 1.25rem', color: '#FC8181' }}>PKR {Number(p.platform_commission).toLocaleString()}</td>
                          <td style={{ padding: '0.875rem 1.25rem', color: '#4ADE80' }}>PKR {Number(p.net_amount).toLocaleString()}</td>
                          <td style={{ padding: '0.875rem 1.25rem', color: 'rgba(240,244,255,0.6)', textTransform: 'capitalize', fontSize: '0.82rem' }}>{p.payment_method as string}</td>
                          <td style={{ padding: '0.875rem 1.25rem' }}>
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', background: p.status === 'completed' ? 'rgba(34,197,94,0.12)' : 'rgba(251,191,36,0.12)', color: p.status === 'completed' ? '#4ADE80' : '#FBD34D' }}>{p.status as string}</span>
                          </td>
                          <td style={{ padding: '0.875rem 1.25rem', color: 'rgba(240,244,255,0.4)', fontSize: '0.78rem' }}>{new Date(p.created_at as string).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
