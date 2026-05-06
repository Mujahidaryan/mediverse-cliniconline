'use client';
import { useEffect, useState, useCallback } from 'react';
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

interface Stats {
  users: { role: string; count: string }[];
  appointments: { status: string; count: string }[];
  payments: { total: string; commission: string };
  pendingApprovals: string;
  revenueByMonth: { month: string; total: string }[];
  doctorStats: { specialization: string; count: string; avg_rating: string }[];
  recentAppointments: Record<string, unknown>[];
}

export default function SuperAdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [userFilter, setUserFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'doctors' | 'approvals'>('overview');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        api.get('/admin/stats'),
        api.get(`/admin/users${userFilter !== 'all' ? `?role=${userFilter}` : ''}`),
      ]);
      setStats(statsData);
      setUsers(usersData.users || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, [userFilter]);

  useEffect(() => {
    if (!user || !['superadmin', 'admin'].includes(user.role)) { router.push('/auth/login'); return; }
    loadData();
  }, [user, router, loadData]);

  const handleUserAction = async (userId: string, action: string) => {
    try {
      await api.patch('/admin/users', { userId, action });
      toast.success('Action completed');
      loadData();
    } catch { toast.error('Failed'); }
  };

  const totalUsers = stats?.users.reduce((s, u) => s + parseInt(u.count), 0) || 0;
  const totalRevenue = parseFloat(stats?.payments?.total || '0');
  const commission = parseFloat(stats?.payments?.commission || '0');
  const totalAppts = stats?.appointments.reduce((s, a) => s + parseInt(a.count), 0) || 0;

  const statusStyle = (s: string): React.CSSProperties => ({
    padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 500, display: 'inline-block',
    ...(s === 'pending' ? { background: 'rgba(251,191,36,0.15)', color: '#FBD34D' } :
       s === 'confirmed' ? { background: 'rgba(34,197,94,0.15)', color: '#4ADE80' } :
       s === 'completed' ? { background: 'rgba(99,102,241,0.15)', color: '#A5B4FC' } :
       { background: 'rgba(239,68,68,0.15)', color: '#FC8181' })
  });

  const G = { background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', WebkitBackgroundClip: 'text' as const, WebkitTextFillColor: 'transparent' as const };

  return (
    <DashboardLayout navItems={NAV} role={user?.role || 'superadmin'}>
      <div style={{ maxWidth: '1200px' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
              <span style={G}>Command Center</span>
            </h1>
            <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Full platform visibility and control.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {parseInt(stats?.pendingApprovals || '0') > 0 && (
              <div style={{ padding: '0.5rem 1rem', borderRadius: '9999px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#FBD34D', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚠️ {stats?.pendingApprovals} pending approvals
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid rgba(201,168,76,0.1)', paddingBottom: '0' }}>
          {[['overview', '📊 Overview'], ['users', '👥 Users'], ['doctors', '🩺 Doctors'], ['approvals', '✅ Approvals']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id as typeof activeTab)} style={{ padding: '0.65rem 1.25rem', borderRadius: '0.75rem 0.75rem 0 0', border: 'none', background: activeTab === id ? 'rgba(201,168,76,0.12)' : 'transparent', color: activeTab === id ? '#E5C97A' : 'rgba(240,244,255,0.5)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: activeTab === id ? 500 : 400, fontFamily: 'inherit', borderBottom: activeTab === id ? '2px solid #C9A84C' : '2px solid transparent' }}>{label}</button>
          ))}
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(240,244,255,0.4)' }}>Loading platform data...</div> : (
          <>
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
                  <StatCard label="Total Users" value={totalUsers} icon="👥" color="#C9A84C" />
                  <StatCard label="All Appointments" value={totalAppts} icon="📅" color="#00D4E8" />
                  <StatCard label="Total Revenue" value={`PKR ${(totalRevenue/1000).toFixed(0)}K`} icon="💰" color="#4ADE80" sub={`Commission: PKR ${(commission/1000).toFixed(0)}K`} />
                  <StatCard label="Pending Approvals" value={stats?.pendingApprovals || 0} icon="⏳" color="#FBD34D" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  {/* Users by role */}
                  <div style={{ padding: '1.5rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.4)', border: '1px solid rgba(201,168,76,0.12)' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.25rem', color: 'rgba(240,244,255,0.8)' }}>Users by Role</h3>
                    {stats?.users.map(u => {
                      const colors: Record<string, string> = { patient: '#F472B6', doctor: '#00D4E8', assistant: '#4ADE80', admin: '#A5B4FC', superadmin: '#C9A84C' };
                      const pct = Math.round(parseInt(u.count) / totalUsers * 100);
                      return (
                        <div key={u.role} style={{ marginBottom: '0.875rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                            <span style={{ textTransform: 'capitalize', color: 'rgba(240,244,255,0.7)' }}>{u.role}</span>
                            <span style={{ color: colors[u.role] || '#C9A84C', fontWeight: 500 }}>{u.count}</span>
                          </div>
                          <div style={{ height: '6px', borderRadius: '9999px', background: 'rgba(255,255,255,0.06)' }}>
                            <div style={{ height: '100%', borderRadius: '9999px', background: colors[u.role] || '#C9A84C', width: `${pct}%`, transition: 'width 0.8s ease' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Appointment statuses */}
                  <div style={{ padding: '1.5rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.4)', border: '1px solid rgba(201,168,76,0.12)' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.25rem', color: 'rgba(240,244,255,0.8)' }}>Appointments by Status</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {stats?.appointments.map(a => (
                        <div key={a.status} style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(10,22,40,0.4)' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', letterSpacing: '-0.5px', marginBottom: '0.25rem' }}>{a.count}</div>
                          <span style={statusStyle(a.status)}>{a.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent appointments */}
                <div style={{ padding: '1.5rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.4)', border: '1px solid rgba(201,168,76,0.12)' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.25rem' }}>Recent Activity</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                      <thead>
                        <tr>{['Patient', 'Doctor', 'Specialization', 'Date', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.6rem 0.5rem', color: 'rgba(240,244,255,0.4)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid rgba(201,168,76,0.08)', fontWeight: 500 }}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {(stats?.recentAppointments || []).map(a => (
                          <tr key={a.id as string} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{a.patient_name as string}</td>
                            <td style={{ padding: '0.75rem 0.5rem', color: 'rgba(240,244,255,0.7)' }}>{a.doctor_name as string}</td>
                            <td style={{ padding: '0.75rem 0.5rem', color: 'rgba(240,244,255,0.5)', fontSize: '0.78rem' }}>{a.specialization as string}</td>
                            <td style={{ padding: '0.75rem 0.5rem', color: 'rgba(240,244,255,0.5)' }}>{new Date(a.appointment_date as string).toLocaleDateString()}</td>
                            <td style={{ padding: '0.75rem 0.5rem' }}><span style={statusStyle(a.status as string)}>{a.status as string}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  {['all','patient','doctor','assistant','admin'].map(r => (
                    <button key={r} onClick={() => setUserFilter(r)} style={{ padding: '0.45rem 1rem', borderRadius: '9999px', border: `1px solid ${userFilter === r ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.12)'}`, background: userFilter === r ? 'rgba(201,168,76,0.12)' : 'none', color: userFilter === r ? '#E5C97A' : 'rgba(240,244,255,0.55)', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'capitalize', fontFamily: 'inherit' }}>{r}</button>
                  ))}
                </div>
                <div style={{ background: 'rgba(15,32,64,0.4)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '1.25rem', overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                          {['Name', 'Email', 'Role', 'Phone', 'Status', 'Joined', 'Actions'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '1rem 1.25rem', color: 'rgba(240,244,255,0.4)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, background: 'rgba(10,22,40,0.3)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => {
                          const roleColors: Record<string, string> = { patient: '#F472B6', doctor: '#00D4E8', assistant: '#4ADE80', admin: '#A5B4FC', superadmin: '#C9A84C' };
                          const rColor = roleColors[u.role as string] || '#C9A84C';
                          return (
                            <tr key={u.id as string} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <td style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>{u.name as string}</td>
                              <td style={{ padding: '1rem 1.25rem', color: 'rgba(240,244,255,0.6)', fontSize: '0.8rem' }}>{u.email as string}</td>
                              <td style={{ padding: '1rem 1.25rem' }}><span style={{ padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 500, background: `${rColor}18`, color: rColor, textTransform: 'capitalize', border: `1px solid ${rColor}30` }}>{u.role as string}</span></td>
                              <td style={{ padding: '1rem 1.25rem', color: 'rgba(240,244,255,0.5)', fontSize: '0.8rem' }}>{u.phone as string || '—'}</td>
                              <td style={{ padding: '1rem 1.25rem' }}><span style={{ padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', background: (u.is_active as boolean) ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: (u.is_active as boolean) ? '#4ADE80' : '#FC8181' }}>{(u.is_active as boolean) ? 'Active' : 'Inactive'}</span></td>
                              <td style={{ padding: '1rem 1.25rem', color: 'rgba(240,244,255,0.4)', fontSize: '0.78rem' }}>{new Date(u.created_at as string).toLocaleDateString()}</td>
                              <td style={{ padding: '1rem 1.25rem' }}>
                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                  {u.role === 'doctor' && !u.profile_approved && (
                                    <button onClick={() => handleUserAction(u.id as string, 'approve_doctor')} style={{ padding: '0.3rem 0.7rem', borderRadius: '9999px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ADE80', cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'inherit' }}>Approve</button>
                                  )}
                                  {u.role === 'assistant' && !u.profile_approved && (
                                    <button onClick={() => handleUserAction(u.id as string, 'approve_assistant')} style={{ padding: '0.3rem 0.7rem', borderRadius: '9999px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ADE80', cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'inherit' }}>Approve</button>
                                  )}
                                  <button onClick={() => handleUserAction(u.id as string, u.is_active ? 'deactivate' : 'activate')} style={{ padding: '0.3rem 0.7rem', borderRadius: '9999px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#FC8181', cursor: 'pointer', fontSize: '0.72rem', fontFamily: 'inherit' }}>
                                    {u.is_active ? 'Deactivate' : 'Activate'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* DOCTORS TAB */}
            {activeTab === 'doctors' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  {(stats?.doctorStats || []).map(d => (
                    <div key={d.specialization} style={{ padding: '1.25rem', borderRadius: '1rem', background: 'rgba(15,32,64,0.5)', border: '1px solid rgba(0,212,232,0.12)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#00D4E8', marginBottom: '0.4rem' }}>{d.specialization}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.5rem', fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', color: '#F0F4FF' }}>{d.count}</span>
                        <span style={{ fontSize: '0.82rem', color: '#C9A84C' }}>⭐ {Number(d.avg_rating).toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* APPROVALS TAB */}
            {activeTab === 'approvals' && (
              <div>
                {users.filter(u => (u.role === 'doctor' || u.role === 'assistant') && !u.profile_approved).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(15,32,64,0.3)', borderRadius: '1.25rem', border: '1px solid rgba(201,168,76,0.08)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>All clear!</div>
                    <div style={{ color: 'rgba(240,244,255,0.4)', fontSize: '0.875rem' }}>No pending approvals at this time.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {users.filter(u => (u.role === 'doctor' || u.role === 'assistant') && !u.profile_approved).map(u => (
                      <div key={u.id as string} style={{ padding: '1.5rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.5)', border: '1px solid rgba(251,191,36,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{u.name as string}</div>
                          <div style={{ fontSize: '0.82rem', color: 'rgba(240,244,255,0.55)' }}>{u.email as string} · {u.role as string}</div>
                          {Boolean(u.specialization) && <div style={{ fontSize: '0.78rem', color: '#00D4E8', marginTop: '0.2rem' }}>{u.specialization as string}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                          <button onClick={() => handleUserAction(u.id as string, u.role === 'doctor' ? 'approve_doctor' : 'approve_assistant')}
                            style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#4ADE80,#22C55E)', color: '#0A1628', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'inherit' }}>
                            ✓ Approve
                          </button>
                          <button onClick={() => handleUserAction(u.id as string, 'deactivate')}
                            style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', border: '1px solid rgba(239,68,68,0.3)', color: '#FC8181', background: 'none', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
