import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, BarChart3, Brain, Search,
  Shield, Activity, ChevronRight, Circle
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tickets', label: 'Tickets', icon: Ticket },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/insights', label: 'Root Cause', icon: Brain },
  { path: '/search', label: 'Issue History', icon: Search },
];

export default function Sidebar({ stats }) {
  return (
    <aside className="w-60 bg-surface-900 border-r border-surface-700 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-700">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-accent-cyan rounded-md flex items-center justify-center">
            <Shield size={15} className="text-surface-950" />
          </div>
          <div>
            <div className="font-display font-bold text-sm text-white tracking-tight">SupportOps</div>
            <div className="text-xs text-gray-600 font-mono">v1.0 · Internal Tool</div>
          </div>
        </div>
      </div>

      {/* Live status bar */}
      <div className="px-4 py-3 border-b border-surface-700">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-slow inline-block" />
          <span className="text-gray-500 font-mono">All systems operational</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="text-xs font-mono text-gray-600 px-3 pb-2 uppercase tracking-widest">Navigation</div>
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`}
          >
            <Icon size={15} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Live Stats */}
      {stats && (
        <div className="px-4 py-4 border-t border-surface-700 space-y-2">
          <div className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-3">Live Queue</div>
          <StatRow label="Open" value={stats.totalOpen} color="text-sky-400" />
          <StatRow label="Escalated" value={stats.totalEscalated} color="text-red-400" />
          <StatRow label="Critical" value={stats.totalCritical} color="text-red-400" pulse={stats.totalCritical > 0} />
        </div>
      )}

      {/* User */}
      <div className="px-4 py-4 border-t border-surface-700">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-accent-cyan/20 border border-accent-cyan/30 flex items-center justify-center">
            <span className="text-xs font-bold text-accent-cyan">SE</span>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-300">Support Engineer</div>
            <div className="text-xs text-gray-600 font-mono">Tier 2</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function StatRow({ label, value, color, pulse }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600">{label}</span>
      <span className={`text-xs font-mono font-bold ${color} ${pulse ? 'animate-pulse' : ''}`}>{value ?? '—'}</span>
    </div>
  );
}
