'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const NAV = [
  { label: 'Dashboard', href: '/dashboard/doctor', icon: '🏠' },
  { label: 'Appointments', href: '/dashboard/doctor/appointments', icon: '🗓️' },
  { label: 'My Schedule', href: '/dashboard/doctor/schedule', icon: '📅' },
  { label: 'Patients', href: '/dashboard/doctor/patients', icon: '👥' },
  { label: 'Earnings', href: '/dashboard/doctor/earnings', icon: '💰' },
  { label: 'Profile', href: '/dashboard/doctor/profile', icon: '👤' },
];

interface Slot { id: string; slot_time: string; is_booked: boolean; }

function getNext7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export default function DoctorSchedulePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [togglingAvail, setTogglingAvail] = useState(false);

  const days = getNext7Days();

  useEffect(() => {
    if (!user || user.role !== 'doctor') { router.push('/auth/login'); return; }
    api.get('/doctor/profile').then(d => setProfile(d.profile)).catch(() => {});
  }, [user, router]);

  const loadSlots = useCallback(async () => {
    if (!profile) return;
    setLoadingSlots(true);
    try {
      const data = await api.get(`/doctors/${profile.id}/slots?date=${selectedDate}`);
      setSlots(data.slots || []);
    } catch { setSlots([]); } finally { setLoadingSlots(false); }
  }, [profile, selectedDate]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  const toggleAvailability = async () => {
    if (!profile) return;
    setTogglingAvail(true);
    try {
      const data = await api.patch('/doctor/profile', { is_available: !profile.is_available });
      setProfile(data.profile);
      toast.success(data.profile.is_available ? 'You are now available for bookings' : 'You are now unavailable for new bookings');
    } catch { toast.error('Failed to update availability'); } finally { setTogglingAvail(false); }
  };

  const isAvail = profile ? (profile.is_available as boolean) : true; // default true until loaded
  const bookedCount = slots.filter(s => s.is_booked).length;

  return (
    <DashboardLayout navItems={NAV} role="doctor">
      <div style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            <span style={{ background: 'linear-gradient(135deg,#00D4E8,#0099AA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>My Schedule</span>
          </h1>
          <p style={{ color: 'rgba(240,244,255,0.55)', fontSize: '0.9rem' }}>Manage your availability and view booked slots.</p>
        </div>

        {/* Availability toggle */}
        <div style={{ padding: '1.5rem', borderRadius: '1.25rem', background: `${isAvail ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)'}`, border: `1px solid ${isAvail ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isAvail ? '#4ADE80' : '#FC8181', boxShadow: isAvail ? '0 0 8px #4ADE80' : '0 0 8px #FC8181' }} />
            <div>
              <div style={{ fontWeight: 600, color: isAvail ? '#4ADE80' : '#FC8181' }}>{isAvail ? 'Available for New Bookings' : 'Not Accepting Bookings'}</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(240,244,255,0.5)', marginTop: '0.2rem' }}>
                {isAvail ? 'Patients can book appointments with you.' : 'You are hidden from the booking list.'}
              </div>
            </div>
          </div>
          <button onClick={toggleAvailability} disabled={togglingAvail} style={{ padding: '0.6rem 1.5rem', borderRadius: '9999px', background: isAvail ? 'rgba(239,68,68,0.12)' : 'linear-gradient(135deg,#4ADE80,#22C55E)', border: isAvail ? '1px solid rgba(239,68,68,0.3)' : 'none', color: isAvail ? '#FC8181' : '#0A1628', cursor: togglingAvail ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit', opacity: togglingAvail ? 0.7 : 1 }}>
            {togglingAvail ? 'Updating...' : isAvail ? 'Go Unavailable' : 'Go Available'}
          </button>
        </div>

        {/* Date picker row */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {days.map(day => {
            const d = new Date(day + 'T00:00:00');
            const isToday = day === new Date().toISOString().split('T')[0];
            const isSel = day === selectedDate;
            return (
              <button key={day} onClick={() => setSelectedDate(day)} style={{ padding: '0.75rem 1rem', borderRadius: '0.875rem', border: `1px solid ${isSel ? 'rgba(0,212,232,0.5)' : 'rgba(201,168,76,0.12)'}`, background: isSel ? 'rgba(0,212,232,0.12)' : 'rgba(15,32,64,0.4)', color: isSel ? '#00D4E8' : 'rgba(240,244,255,0.7)', cursor: 'pointer', fontFamily: 'inherit', minWidth: '72px', textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem', color: isSel ? '#00D4E8' : 'rgba(240,244,255,0.4)' }}>{isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{d.getDate()}</div>
                <div style={{ fontSize: '0.65rem', color: isSel ? '#00D4E8' : 'rgba(240,244,255,0.35)', marginTop: '0.15rem' }}>{d.toLocaleDateString('en-US', { month: 'short' })}</div>
              </button>
            );
          })}
        </div>

        {/* Slots grid */}
        <div style={{ background: 'rgba(15,32,64,0.4)', border: '1px solid rgba(0,212,232,0.12)', borderRadius: '1.25rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            {slots.length > 0 && (
              <span style={{ fontSize: '0.8rem', color: 'rgba(240,244,255,0.45)' }}>{bookedCount}/{slots.length} booked</span>
            )}
          </div>
          {loadingSlots ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(240,244,255,0.4)' }}>Loading slots...</div>
          ) : slots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(240,244,255,0.4)', fontSize: '0.875rem' }}>No slots generated yet. Slots are created when a patient views your booking page.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '0.6rem' }}>
              {slots.map(slot => (
                <div key={slot.id} style={{ padding: '0.75rem 0.5rem', borderRadius: '0.75rem', border: `1px solid ${slot.is_booked ? 'rgba(99,102,241,0.3)' : 'rgba(34,197,94,0.25)'}`, background: slot.is_booked ? 'rgba(99,102,241,0.1)' : 'rgba(34,197,94,0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 500, color: slot.is_booked ? '#A5B4FC' : '#4ADE80', marginBottom: '0.25rem' }}>{slot.slot_time.slice(0, 5)}</div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(240,244,255,0.4)' }}>{slot.is_booked ? 'Booked' : 'Open'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
