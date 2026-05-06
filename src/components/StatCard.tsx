'use client';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  sub?: string;
}

export default function StatCard({ label, value, icon, color = '#C9A84C', sub }: StatCardProps) {
  return (
    <div style={{ padding: '1.5rem', borderRadius: '1.25rem', background: 'rgba(15,32,64,0.55)', border: '1px solid rgba(201,168,76,0.12)', backdropFilter: 'blur(16px)', transition: 'all 0.3s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '0.75rem', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>{icon}</div>
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '2.25rem', color: '#F0F4FF', letterSpacing: '-1px', lineHeight: 1, marginBottom: '0.35rem' }}>{value}</div>
      <div style={{ fontSize: '0.82rem', color: 'rgba(240,244,255,0.55)', fontWeight: 400 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color, marginTop: '0.5rem', fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}
