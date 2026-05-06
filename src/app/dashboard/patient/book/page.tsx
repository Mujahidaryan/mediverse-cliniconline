'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const NAV = [
  { label: 'Dashboard', href: '/dashboard/patient', icon: '🏠' },
  { label: 'Book Consultation', href: '/dashboard/patient/book', icon: '📅' },
  { label: 'My Appointments', href: '/dashboard/patient/appointments', icon: '🗓️' },
  { label: 'Home Assistants', href: '/dashboard/patient/assistants', icon: '🤲' },
  { label: 'Health Records', href: '/dashboard/patient/records', icon: '📋' },
  { label: 'Payments', href: '/dashboard/patient/payments', icon: '💳' },
  { label: 'Profile', href: '/dashboard/patient/profile', icon: '👤' },
];

const SPECIALIZATIONS = ['all','General Physician','Cardiologist','Neurologist','Dermatologist','Orthopedic','Pediatrician','Gynecologist','Psychiatrist','Nephrologist'];

interface Doctor {
  id: string; name: string; specialization: string; experience_years: number;
  rating: number; total_reviews: number; consultation_fee: number;
  hospital: string; location: string; is_available: boolean; bio: string;
}

interface Slot { id: string; slot_time: string; is_booked: boolean; }

export default function BookPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [step, setStep] = useState<'type'|'doctors'|'slots'|'confirm'>('type');
  const [serviceType, setServiceType] = useState<'general'|'specialized'|''>('');
  const [specFilter, setSpecFilter] = useState('all');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [symptoms, setSymptoms] = useState('');
  const [booking, setBooking] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'patient') { router.push('/auth/login'); return; }
  }, [user, router]);

  useEffect(() => {
    if (step === 'doctors') {
      const params = new URLSearchParams();
      if (specFilter !== 'all') params.set('specialization', specFilter);
      if (search) params.set('search', search);
      if (serviceType === 'general') params.set('specialization', 'General Physician');
      api.get(`/doctors?${params}`).then(d => setDoctors(d.doctors || [])).catch(() => toast.error('Failed to load doctors'));
    }
  }, [step, specFilter, search, serviceType]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      api.get(`/doctors/${selectedDoctor.id}/slots?date=${selectedDate}`).then(d => setSlots(d.slots || [])).catch(() => {});
    }
  }, [selectedDoctor, selectedDate]);

  const selectType = (type: 'general' | 'specialized') => {
    setServiceType(type);
    if (type === 'general') setSpecFilter('General Physician');
    setStep('doctors');
  };

  const selectDoctor = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setStep('slots');
  };

  const confirmBooking = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    setBooking(true);
    try {
      await api.post('/appointments', {
        doctor_id: selectedDoctor.id,
        slot_id: selectedSlot.id,
        appointment_date: selectedDate,
        appointment_time: selectedSlot.slot_time,
        type: serviceType === 'general' ? 'general' : 'specialized',
        symptoms,
      });
      toast.success('Appointment booked successfully!');
      router.push('/dashboard/patient/appointments');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Booking failed');
    } finally { setBooking(false); }
  };

  const G = { background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', WebkitBackgroundClip: 'text' as const, WebkitTextFillColor: 'transparent' as const };

  return (
    <DashboardLayout navItems={NAV} role="patient">
      <div style={{ maxWidth: '1000px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', letterSpacing: '-1px', marginBottom: '0.35rem' }}>
            <span style={G}>Book Consultation</span>
          </h1>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'rgba(240,244,255,0.45)' }}>
            {['Select Type', 'Choose Doctor', 'Pick Slot', 'Confirm'].map((s, i) => {
              const steps = ['type','doctors','slots','confirm'];
              const current = steps.indexOf(step);
              return (
                <>
                  <span key={s} style={{ color: i <= current ? '#C9A84C' : undefined, fontWeight: i === current ? 600 : 400 }}>{s}</span>
                  {i < 3 && <span>›</span>}
                </>
              );
            })}
          </div>
        </div>

        {/* STEP 1: Service Type */}
        {step === 'type' && (
          <div>
            <p style={{ color: 'rgba(240,244,255,0.6)', marginBottom: '2rem', fontSize: '0.95rem' }}>What type of care do you need today?</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
              {[
                { type: 'general' as const, icon: '🏥', title: 'General Consultation', desc: 'Routine checkups, fever, cold, general health queries. Instant availability.' },
                { type: 'specialized' as const, icon: '🩺', title: 'Specialized Doctor', desc: 'Cardiology, Neurology, Dermatology, Orthopedics and 5 more specializations.' },
                { type: null, icon: '🏠', title: 'Home Assistant', desc: 'Nursing, elderly care, physiotherapy & post-surgery at your home.', href: '/dashboard/patient/assistants' },
              ].map((opt) => (
                <button key={opt.title} onClick={() => opt.type ? selectType(opt.type) : router.push(opt.href!)}
                  style={{ padding: '2rem', borderRadius: '1.5rem', background: 'rgba(15,32,64,0.55)', border: '1px solid rgba(201,168,76,0.15)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s', fontFamily: 'inherit' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.4)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.15)'; (e.currentTarget as HTMLElement).style.transform = ''; }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{opt.icon}</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '1.4rem', color: '#F0F4FF', marginBottom: '0.6rem', letterSpacing: '-0.5px' }}>{opt.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(240,244,255,0.55)', lineHeight: 1.6 }}>{opt.desc}</p>
                  <div style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: '#C9A84C', fontWeight: 500 }}>Select →</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Doctors List */}
        {step === 'doctors' && (
          <div>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={() => setStep('type')} style={{ padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C', background: 'none', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit' }}>← Back</button>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors..." style={{ padding: '0.6rem 1rem', borderRadius: '9999px', background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(201,168,76,0.15)', color: '#F0F4FF', outline: 'none', fontSize: '0.875rem', fontFamily: 'inherit', flex: 1, minWidth: '200px' }} />
              {serviceType === 'specialized' && (
                <select value={specFilter} onChange={e => setSpecFilter(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: '9999px', background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(201,168,76,0.2)', color: '#F0F4FF', outline: 'none', fontSize: '0.875rem', fontFamily: 'inherit', cursor: 'pointer' }}>
                  {SPECIALIZATIONS.filter(s => s !== 'General Physician').map(s => <option key={s} value={s}>{s === 'all' ? 'All Specializations' : s}</option>)}
                </select>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.25rem' }}>
              {doctors.map(doc => (
                <div key={doc.id} style={{ padding: '1.5rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.55)', border: '1px solid rgba(201,168,76,0.12)', transition: 'all 0.3s', cursor: 'pointer' }}
                  onClick={() => selectDoctor(doc)}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.35)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.12)'; }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#00D4E888,#00D4E844)', border: '2px solid #00D4E830', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>👨‍⚕️</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.2rem' }}>{doc.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#00D4E8', marginBottom: '0.2rem' }}>{doc.specialization}</div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(240,244,255,0.5)' }}>{doc.hospital} · {doc.location}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.85rem', color: '#C9A84C', fontWeight: 600 }}>⭐ {Number(doc.rating).toFixed(1)}</div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(240,244,255,0.4)' }}>{doc.total_reviews} reviews</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(240,244,255,0.45)', marginBottom: '0.1rem' }}>Experience</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{doc.experience_years} yrs</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(240,244,255,0.45)', marginBottom: '0.1rem' }}>Availability</div>
                      <div style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', background: doc.is_available ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: doc.is_available ? '#4ADE80' : '#FC8181' }}>{doc.is_available ? 'Available' : 'Busy'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(240,244,255,0.45)', marginBottom: '0.1rem' }}>Fee</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#C9A84C' }}>PKR {Number(doc.consultation_fee).toLocaleString()}</div>
                    </div>
                  </div>
                  <button style={{ width: '100%', marginTop: '1rem', padding: '0.65rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', color: '#0A1628', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'inherit' }}>Book Now →</button>
                </div>
              ))}
            </div>
            {doctors.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(240,244,255,0.4)' }}>No doctors found. Try adjusting your filters.</div>}
          </div>
        )}

        {/* STEP 3: Slot Selection */}
        {step === 'slots' && selectedDoctor && (
          <div>
            <button onClick={() => setStep('doctors')} style={{ padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C', background: 'none', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit', marginBottom: '1.5rem' }}>← Back to Doctors</button>
            <div style={{ background: 'rgba(15,32,64,0.55)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '1.25rem', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#00D4E888,#00D4E844)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>👨‍⚕️</div>
              <div>
                <div style={{ fontWeight: 600 }}>{selectedDoctor.name}</div>
                <div style={{ fontSize: '0.82rem', color: '#00D4E8' }}>{selectedDoctor.specialization} · {selectedDoctor.hospital}</div>
                <div style={{ fontSize: '0.82rem', color: '#C9A84C', fontWeight: 600 }}>Fee: PKR {Number(selectedDoctor.consultation_fee).toLocaleString()}</div>
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'rgba(240,244,255,0.6)', marginBottom: '0.5rem' }}>Select Date</label>
              <input type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]}
                onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
                style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(201,168,76,0.2)', color: '#F0F4FF', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'rgba(240,244,255,0.6)', marginBottom: '0.75rem' }}>Available Time Slots</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '0.6rem' }}>
                {slots.map(slot => (
                  <button key={slot.id} disabled={slot.is_booked} onClick={() => setSelectedSlot(slot)}
                    style={{ padding: '0.6rem', borderRadius: '0.75rem', border: `1px solid ${selectedSlot?.id === slot.id ? '#C9A84C' : slot.is_booked ? 'rgba(239,68,68,0.2)' : 'rgba(201,168,76,0.15)'}`, background: selectedSlot?.id === slot.id ? 'rgba(201,168,76,0.2)' : slot.is_booked ? 'rgba(239,68,68,0.05)' : 'rgba(10,22,40,0.5)', color: slot.is_booked ? 'rgba(240,244,255,0.25)' : selectedSlot?.id === slot.id ? '#E5C97A' : '#F0F4FF', cursor: slot.is_booked ? 'not-allowed' : 'pointer', fontSize: '0.78rem', fontFamily: 'inherit', textDecoration: slot.is_booked ? 'line-through' : 'none' }}>
                    {slot.slot_time.slice(0, 5)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'rgba(240,244,255,0.6)', marginBottom: '0.5rem' }}>Symptoms / Reason for Visit</label>
              <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="Briefly describe your symptoms or reason for consultation..."
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(10,22,40,0.6)', border: '1px solid rgba(201,168,76,0.15)', color: '#F0F4FF', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: '100px' }} />
            </div>
            <button onClick={() => setStep('confirm')} disabled={!selectedSlot}
              style={{ padding: '0.85rem 2.5rem', borderRadius: '9999px', background: selectedSlot ? 'linear-gradient(135deg,#E5C97A,#C9A84C)' : 'rgba(201,168,76,0.2)', color: selectedSlot ? '#0A1628' : 'rgba(240,244,255,0.3)', border: 'none', cursor: selectedSlot ? 'pointer' : 'not-allowed', fontWeight: 600, fontSize: '0.95rem', fontFamily: 'inherit' }}>
              Review Booking →
            </button>
          </div>
        )}

        {/* STEP 4: Confirm */}
        {step === 'confirm' && selectedDoctor && selectedSlot && (
          <div style={{ maxWidth: '500px' }}>
            <button onClick={() => setStep('slots')} style={{ padding: '0.5rem 1rem', borderRadius: '9999px', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C', background: 'none', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit', marginBottom: '1.5rem' }}>← Back</button>
            <div style={{ background: 'rgba(15,32,64,0.6)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '1.5rem', padding: '2rem' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '1.5rem', marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>Confirm Booking</h2>
              {[
                { label: 'Doctor', value: selectedDoctor.name },
                { label: 'Specialization', value: selectedDoctor.specialization },
                { label: 'Hospital', value: selectedDoctor.hospital },
                { label: 'Date', value: new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                { label: 'Time', value: selectedSlot.slot_time.slice(0, 5) },
                { label: 'Consultation Fee', value: `PKR ${Number(selectedDoctor.consultation_fee).toLocaleString()}`, gold: true },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'rgba(240,244,255,0.5)' }}>{r.label}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: r.gold ? '#C9A84C' : '#F0F4FF' }}>{r.value}</span>
                </div>
              ))}
              {symptoms && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(10,22,40,0.4)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(240,244,255,0.45)', marginBottom: '0.3rem' }}>Symptoms</div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(240,244,255,0.75)' }}>{symptoms}</div>
                </div>
              )}
              <button onClick={confirmBooking} disabled={booking}
                style={{ width: '100%', marginTop: '1.5rem', padding: '0.9rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', color: '#0A1628', border: 'none', cursor: booking ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'inherit', opacity: booking ? 0.7 : 1 }}>
                {booking ? 'Confirming...' : '✓ Confirm & Book Appointment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
