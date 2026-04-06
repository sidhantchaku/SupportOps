import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ label, value, sub, icon: Icon, color = 'var(--accent)', trend, alert }) {
  return (
    <div className="card" style={{
      padding: '18px 20px',
      borderLeft: alert ? `3px solid ${color}` : undefined,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 80, height: 80,
        background: `radial-gradient(circle at 100% 0%, ${color}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8,
          }}>
            {label}
          </div>
          <div style={{
            fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-head)',
            color: alert ? color : 'var(--text-primary)', lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>
            {value ?? '—'}
          </div>
          {sub && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 6 }}>
              {sub}
            </div>
          )}
          {trend !== undefined && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: '12px', marginTop: 6,
              color: trend >= 0 ? 'var(--p3)' : 'var(--p0)',
            }}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(trend)}% vs last period</span>
            </div>
          )}
        </div>
        {Icon && (
          <div style={{
            width: 36, height: 36, borderRadius: var_radius,
            background: `${color}18`, border: `1px solid ${color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color, flexShrink: 0,
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}

const var_radius = 'var(--radius-sm)';
