import { SEVERITY_CONFIG, STATUS_CONFIG } from '../../utils/constants';

export function SeverityBadge({ severity, showDot = false }) {
  const config = SEVERITY_CONFIG[severity];
  if (!config) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded ${config.badge}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      {severity}
    </span>
  );
}

export function StatusBadge({ status, showDot = true }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded ${config.badge}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      {status}
    </span>
  );
}

export function Tag({ children }) {
  return <span className="tag">{children}</span>;
}
