export function SeverityBadge({ severity }) {
  const map = {
    P0: { label: 'P0 · CRITICAL', bg: 'var(--p0-bg)', color: 'var(--p0)', border: 'rgba(255,71,87,0.3)' },
    P1: { label: 'P1 · HIGH',     bg: 'var(--p1-bg)', color: 'var(--p1)', border: 'rgba(255,159,67,0.3)' },
    P2: { label: 'P2 · MEDIUM',   bg: 'var(--p2-bg)', color: 'var(--p2)', border: 'rgba(255,211,42,0.3)' },
    P3: { label: 'P3 · LOW',      bg: 'var(--p3-bg)', color: 'var(--p3)', border: 'rgba(46,213,115,0.3)' },
  };
  const s = map[severity] || map.P3;
  return (
    <span className="badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    'Open':        { color: 'var(--status-open)',       bg: 'rgba(61,132,247,0.12)',  border: 'rgba(61,132,247,0.3)' },
    'In Progress': { color: 'var(--status-inprogress)', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)' },
    'Escalated':   { color: 'var(--status-escalated)',  bg: 'rgba(255,71,87,0.12)',  border: 'rgba(255,71,87,0.3)' },
    'Resolved':    { color: 'var(--status-resolved)',   bg: 'rgba(46,213,115,0.10)', border: 'rgba(46,213,115,0.3)' },
    'Closed':      { color: 'var(--status-closed)',     bg: 'rgba(77,84,94,0.15)',   border: 'rgba(77,84,94,0.3)' },
    'Duplicate':   { color: 'var(--status-duplicate)',  bg: 'rgba(139,145,154,0.1)', border: 'rgba(139,145,154,0.3)' },
  };
  const s = map[status] || map['Open'];
  return (
    <span className="badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  );
}

export function CategoryTag({ category }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: '11px',
      background: 'var(--bg-overlay)', color: 'var(--text-secondary)',
      border: '1px solid var(--border)', borderRadius: '3px',
      padding: '1px 7px', fontFamily: 'var(--font-mono)',
    }}>
      {category}
    </span>
  );
}

export function ImpactBadge({ impact }) {
  const map = {
    Critical: { color: '#ff4757', bg: 'rgba(255,71,87,0.12)' },
    High:     { color: '#ff9f43', bg: 'rgba(255,159,67,0.12)' },
    Medium:   { color: '#ffd32a', bg: 'rgba(255,211,42,0.10)' },
    Low:      { color: '#2ed573', bg: 'rgba(46,213,115,0.10)' },
    None:     { color: '#4d545e', bg: 'rgba(77,84,94,0.15)' },
  };
  const s = map[impact] || map.Medium;
  return (
    <span style={{
      fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-mono)',
      color: s.color, background: s.bg, borderRadius: '3px',
      padding: '2px 6px',
    }}>
      {impact}
    </span>
  );
}
