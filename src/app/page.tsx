'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [counts, setCounts] = useState({ patients: 0, countries: 0, doctors: 0, satisfaction: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const targets = { patients: 1000000, countries: 50, doctors: 200, satisfaction: 98 };
    let step = 0; const steps = 60;
    const iv = setInterval(() => {
      step++;
      const e = 1 - Math.pow(1 - step / steps, 3);
      setCounts({ patients: Math.floor(targets.patients * e), countries: Math.floor(targets.countries * e), doctors: Math.floor(targets.doctors * e), satisfaction: Math.floor(targets.satisfaction * e) });
      if (step >= steps) clearInterval(iv);
    }, 2000 / steps);
    return () => clearInterval(iv);
  }, []);

  const specializations = [
    { icon: '🫀', name: 'Cardiology', desc: 'Heart & Cardiovascular' },
    { icon: '🧠', name: 'Neurology', desc: 'Brain & Nervous System' },
    { icon: '🦴', name: 'Orthopedics', desc: 'Bones & Joints' },
    { icon: '👶', name: 'Pediatrics', desc: 'Child Healthcare' },
    { icon: '🔬', name: 'Dermatology', desc: 'Skin & Hair' },
    { icon: '🧬', name: 'Nephrology', desc: 'Kidney Care' },
    { icon: '🌸', name: 'Gynecology', desc: "Women's Health" },
    { icon: '🧘', name: 'Psychiatry', desc: 'Mental Wellness' },
  ];

  const G = (s: string) => ({ background: `linear-gradient(135deg,${s})`, WebkitBackgroundClip: 'text' as const, WebkitTextFillColor: 'transparent' as const });

  return (
    <div style={{ background: '#0A1628', minHeight: '100vh', color: '#F0F4FF', fontFamily: "'DM Sans',sans-serif", overflowX: 'hidden', width: '100%' }}>
      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: isMobile ? '0.875rem 1.25rem' : '1rem 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: scrolled ? 'rgba(10,22,40,0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(201,168,76,0.12)' : 'none', transition: 'all 0.4s', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Image src="/logo.png" alt="Mediverse" width={36} height={36} style={{ borderRadius: '8px' }} />
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '1.3rem' }}>Medi<span style={{ color: '#C9A84C' }}>verse</span></span>
        </div>
        {isMobile ? (
          <button onClick={() => setMenuOpen(m => !m)} style={{ background: 'none', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '0.5rem', color: '#C9A84C', padding: '0.4rem 0.7rem', cursor: 'pointer', fontSize: '1.1rem' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {['Services', 'Doctors', 'About'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{ padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', color: 'rgba(240,244,255,0.75)', textDecoration: 'none' }}>{l}</a>
            ))}
            <Link href="/auth/login" style={{ padding: '0.55rem 1.4rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', color: '#0A1628', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem' }}>Sign In</Link>
          </div>
        )}
      </nav>

      {/* Mobile menu dropdown */}
      {isMobile && menuOpen && (
        <div style={{ position: 'fixed', top: '56px', left: 0, right: 0, zIndex: 99, background: 'rgba(10,22,40,0.97)', borderBottom: '1px solid rgba(201,168,76,0.15)', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {['Services', 'Doctors', 'About'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)} style={{ padding: '0.75rem 1rem', borderRadius: '0.6rem', fontSize: '0.9rem', color: 'rgba(240,244,255,0.8)', textDecoration: 'none', background: 'rgba(255,255,255,0.04)' }}>{l}</a>
          ))}
          <Link href="/auth/login" onClick={() => setMenuOpen(false)} style={{ marginTop: '0.5rem', padding: '0.75rem 1rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', color: '#0A1628', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem', textAlign: 'center' }}>Sign In</Link>
          <Link href="/auth/register" onClick={() => setMenuOpen(false)} style={{ padding: '0.75rem 1rem', borderRadius: '9999px', border: '1px solid rgba(201,168,76,0.3)', color: '#E5C97A', textDecoration: 'none', fontSize: '0.9rem', textAlign: 'center' }}>Register</Link>
        </div>
      )}

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', overflow: 'hidden', padding: isMobile ? '7rem 1.25rem 3rem' : '0 2rem', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/hero-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(2px) brightness(0.3)', transform: 'scale(1.05)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(10,22,40,0.5) 0%,rgba(10,22,40,0.2) 40%,rgba(10,22,40,0.9) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '860px', width: '100%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 1rem 0.4rem 0.5rem', borderRadius: '9999px', background: 'rgba(15,32,64,0.7)', border: '1px solid rgba(201,168,76,0.25)', marginBottom: '2rem', backdropFilter: 'blur(8px)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', color: '#0A1628', padding: '0.2rem 0.75rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700 }}>SDG 3</span>
            <span style={{ fontSize: '0.82rem', color: 'rgba(240,244,255,0.8)' }}>Good Health &amp; Well-Being for All Nations</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 'clamp(2.4rem,7vw,5.5rem)', lineHeight: 0.95, letterSpacing: 'clamp(-1px,-3px,-3px)', marginBottom: '1.5rem' }}>
            Transforming<br /><span style={G('#E5C97A,#C9A84C,#A07830')}>Global Healthcare</span><br />Through Digital Innovation
          </h1>
          <p style={{ fontSize: isMobile ? '0.92rem' : '1.05rem', color: 'rgba(240,244,255,0.72)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.75 }}>
            AI-powered medical access across 50+ nations — aligned with WHO standards, UN SDGs, and scalable healthcare infrastructure.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link href="/auth/login" style={{ padding: '0.9rem 2.2rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', color: '#0A1628', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>Access Digital Care →</Link>
            <Link href="/auth/register" style={{ padding: '0.9rem 2.2rem', borderRadius: '9999px', border: '1px solid rgba(201,168,76,0.35)', color: '#E5C97A', textDecoration: 'none', fontSize: '0.95rem', background: 'rgba(10,22,40,0.5)', backdropFilter: 'blur(8px)' }}>Partner With Us</Link>
          </div>
          {/* Stats — 2×2 on mobile, 4 cols on desktop */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '0.75rem', maxWidth: '700px', margin: '0 auto' }}>
            {[
              { num: counts.patients >= 1000000 ? '1M+' : counts.patients.toLocaleString(), label: 'Patients Served' },
              { num: `${counts.countries}+`, label: 'Countries' },
              { num: `${counts.doctors}+`, label: 'Specialists' },
              { num: `${counts.satisfaction}%`, label: 'Satisfaction' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '1rem', borderRadius: '1rem', background: 'rgba(15,32,64,0.55)', border: '1px solid rgba(201,168,76,0.15)', backdropFilter: 'blur(12px)', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '1.75rem', ...G('#E5C97A,#C9A84C'), letterSpacing: '-1px', lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(240,244,255,0.55)', marginTop: '0.3rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" style={{ padding: isMobile ? '4rem 1.25rem' : '7rem 2rem', background: '#0A1628', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#C9A84C', marginBottom: '1rem' }}>// Services</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 'clamp(2rem,5vw,4rem)', letterSpacing: '-2px', marginBottom: '1rem' }}>Healthcare <span style={G('#E5C97A,#C9A84C')}>Under One Roof</span></h2>
          <p style={{ color: 'rgba(240,244,255,0.6)', maxWidth: '550px', margin: '0 auto 3rem', lineHeight: 1.7, fontSize: '0.9rem' }}>Three integrated verticals designed to cover every dimension of patient care globally.</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '1.25rem' }}>
            {[
              { icon: '🏥', title: 'General Consultation', desc: 'Connect with GPs instantly via video or chat. Available 24/7 across all time zones.' },
              { icon: '🩺', title: 'Specialized Doctors', desc: 'Access 8+ specializations — Cardiology, Neurology, Orthopedics — from world-class institutions.' },
              { icon: '🏠', title: 'Home Medical Assistance', desc: 'Certified nursing and care assistants deployed to your home. Elderly care, physiotherapy, post-surgery.' },
            ].map((s, i) => (
              <div key={i} style={{ padding: isMobile ? '1.75rem 1.25rem' : '2.5rem 2rem', borderRadius: '1.5rem', background: 'rgba(15,32,64,0.55)', border: '1px solid rgba(201,168,76,0.15)', backdropFilter: 'blur(16px)', textAlign: 'left' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{s.icon}</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '1.5rem', marginBottom: '0.65rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(240,244,255,0.6)', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIALIZATIONS */}
      <section id="doctors" style={{ padding: isMobile ? '4rem 1.25rem' : '7rem 2rem', background: '#0B1A30', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#C9A84C', marginBottom: '1rem' }}>// Specializations</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 'clamp(2rem,5vw,4rem)', letterSpacing: '-2px' }}>World-class <span style={G('#E5C97A,#C9A84C')}>Specialists</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '1rem', marginBottom: '3rem' }}>
            {specializations.map((s, i) => (
              <div key={i} style={{ padding: '1.5rem 1rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.5)', border: '1px solid rgba(201,168,76,0.12)', textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.6rem' }}>{s.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.2rem' }}>{s.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(240,244,255,0.5)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <Link href="/auth/login" style={{ padding: '0.9rem 2.5rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', color: '#0A1628', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}>Book a Consultation</Link>
          </div>
        </div>
      </section>

      {/* COMPLIANCE */}
      <section id="about" style={{ padding: isMobile ? '4rem 1.25rem' : '6rem 2rem', background: '#0A1628', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#C9A84C', marginBottom: '1rem' }}>// Trust & Compliance</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 'clamp(1.75rem,4vw,2.5rem)', letterSpacing: '-1.5px', marginBottom: '2.5rem' }}>Aligned with <span style={G('#E5C97A,#C9A84C')}>global standards</span></h2>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['HIPAA Compliant', 'GDPR Certified', 'WHO Aligned', 'ISO 27001', 'UN SDG 3', 'CE Marked'].map(b => (
              <span key={b} style={{ padding: '0.55rem 1.2rem', borderRadius: '9999px', border: '1px solid rgba(201,168,76,0.25)', color: '#E5C97A', fontSize: '0.82rem', background: 'rgba(201,168,76,0.06)' }}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: isMobile ? '3rem 1.25rem' : '6rem 2rem', background: '#0B1A30', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', padding: isMobile ? '2.5rem 1.5rem' : '4rem 3rem', borderRadius: '2rem', background: 'rgba(15,32,64,0.6)', border: '1px solid rgba(201,168,76,0.2)', backdropFilter: 'blur(20px)', boxSizing: 'border-box' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: 'clamp(1.75rem,4vw,3rem)', letterSpacing: '-1.5px', marginBottom: '1.25rem' }}>Join the Future<br /><span style={G('#E5C97A,#C9A84C')}>of Healthcare</span></h2>
          <p style={{ color: 'rgba(240,244,255,0.6)', marginBottom: '2rem', lineHeight: 1.7, fontSize: '0.9rem' }}>Patient, doctor, NGO, or investor — Mediverse has a pathway for you.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register" style={{ padding: '0.9rem 2.2rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#E5C97A,#C9A84C)', color: '#0A1628', fontWeight: 600, textDecoration: 'none' }}>Get Started Free</Link>
            <Link href="/auth/login" style={{ padding: '0.9rem 2.2rem', borderRadius: '9999px', border: '1px solid rgba(201,168,76,0.3)', color: '#E5C97A', textDecoration: 'none', background: 'rgba(10,22,40,0.5)' }}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#060E1A', borderTop: '1px solid rgba(201,168,76,0.1)', padding: isMobile ? '2.5rem 1.25rem 1.5rem' : '3rem 3rem 2rem', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Image src="/logo.png" alt="Logo" width={32} height={32} style={{ borderRadius: '6px' }} />
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '1.2rem' }}>Mediverse</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(240,244,255,0.4)', maxWidth: '240px', lineHeight: 1.7, margin: 0 }}>Health. Connected. Everywhere.</p>
            </div>
            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              {[['Platform', ['Consultations', 'AI Diagnostics', 'Home Assistants']], ['Compliance', ['HIPAA', 'WHO Guidelines', 'Privacy Policy']]].map(([title, links]) => (
                <div key={title as string}>
                  <div style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'rgba(240,244,255,0.35)', marginBottom: '1rem' }}>{title as string}</div>
                  {(links as string[]).map(l => <a key={l} href="#" style={{ display: 'block', fontSize: '0.82rem', color: 'rgba(240,244,255,0.5)', textDecoration: 'none', marginBottom: '0.6rem' }}>{l}</a>)}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.77rem', color: 'rgba(240,244,255,0.3)' }}>© 2025 Mediverse. All rights reserved.</span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(240,244,255,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A84C', display: 'inline-block' }} /> Aligned with UN SDGs
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
