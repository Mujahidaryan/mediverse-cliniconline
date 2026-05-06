'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';
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

const ROLE_COLORS: Record<string, string> = { patient: '#F472B6', doctor: '#00D4E8', assistant: '#4ADE80', admin: '#A5B4FC', superadmin: '#C9A84C' };

export default function UsersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.get(`/admin/users${filter !== 'all' ? `?role=${filter}` : ''}`);
      setUsers(d.users || []);
    } catch { toast.error('Failed to load users'); } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => {
    if (!user || !['superadmin', 'admin'].includes(user.role)) { router.push('/auth/login'); return; }
    load();
  }, [user, router, load]);

  const action = async (userId: string, act: string) => {
    try {
      await api.patch('/admin/users', { userId, action: act });
      toast.success('Done');
      load();
    } catch { toast.error('Action failed'); }
  };

  const filtered = users.filter(u =>
    (u.name as string)?.toLowerCase().includes(search.toLowerCase()) ||
    (u.email as string)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout navItems={NAV} role={user?.role || 'superadmin'}>
      <div style={{ maxWidth: '1200px' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
              <span style={{ background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>User Management</span>
            </h1>
            <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>{filtered.length} user{filtered.length !== 1 ? 's' : ''} displayed.</p>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..." style={{ padding: '0.6rem 1rem', borderRadius: '9999px', background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(201,168,76,0.2)', color: '#F0F4FF', outline: 'none', fontSize: '0.875rem', fontFamily: 'inherit', minWidth: '240px' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['all', 'patient', 'doctor', 'assistant', 'admin'].map(r => (
            <button key={r} onClick={() => setFilter(r)} style={{ padding: '0.45rem 1rem', borderRadius: '9999px', border: `1px solid ${filter === r ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.12)'}`, background: filter === r ? 'rgba(201,168,76,0.12)' : 'none', color: filter === r ? '#E5C97A' : 'rgba(240,244,255,0.5)', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'capitalize', fontFamily: 'inherit' }}>{r}</button>
          ))}
        </div>

        <div style={{ background: 'rgba(15,32,64,0.4)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '1.25rem', overflow: 'hidden' }}>
          {loading ? <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(240,244,255,0.4)' }}>Loading...</div> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(10,22,40,0.4)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                    {['Name', 'Email', 'Role', 'Phone', 'Status', 'Approved', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '1rem 1.25rem', color: 'rgba(240,244,255,0.4)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => {
                    const rc = ROLE_COLORS[u.role as string] || '#C9A84C';
                    return (
                      <tr key={u.id as string} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 500, whiteSpace: 'nowrap' }}>{u.name as string}</td>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(240,244,255,0.6)', fontSize: '0.8rem' }}>{u.email as string}</td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{ padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 500, background: `${rc}18`, color: rc, textTransform: 'capitalize', border: `1px solid ${rc}30` }}>{u.role as string}</span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(240,244,255,0.5)', fontSize: '0.8rem' }}>{(u.phone as string) || '—'}</td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', background: (u.is_active as boolean) ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: (u.is_active as boolean) ? '#4ADE80' : '#FC8181' }}>{(u.is_active as boolean) ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          {['doctor', 'assistant'].includes(u.role as string)
                            ? <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.72rem', background: (u.profile_approved as boolean) ? 'rgba(34,197,94,0.1)' : 'rgba(251,191,36,0.1)', color: (u.profile_approved as boolean) ? '#4ADE80' : '#FBD34D' }}>{(u.profile_approved as boolean) ? 'Approved' : 'Pending'}</span>
                            : <span style={{ color: 'rgba(240,244,255,0.3)', fontSize: '0.78rem' }}>—</span>
                          }
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: 'rgba(240,244,255,0.4)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{new Date(u.created_at as string).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap' }}>
                            {(u.role === 'doctor' && !u.profile_approved) && (
                              <button onClick={() => action(u.id as string, 'approve_doctor')} style={{ padding: '0.3rem 0.7rem', borderRadius: '9999px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ADE80', cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Approve</button>
                            )}
                            {(u.role === 'assistant' && !u.profile_approved) && (
                              <button onClick={() => action(u.id as string, 'approve_assistant')} style={{ padding: '0.3rem 0.7rem', borderRadius: '9999px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ADE80', cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Approve</button>
                            )}
                            {!['superadmin'].includes(u.role as string) && (
                              <button onClick={() => action(u.id as string, (u.is_active as boolean) ? 'deactivate' : 'activate')} style={{ padding: '0.3rem 0.7rem', borderRadius: '9999px', border: '1px solid rgba(239,68,68,0.25)', color: '#FC8181', background: 'none', cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>{(u.is_active as boolean) ? 'Deactivate' : 'Activate'}</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
