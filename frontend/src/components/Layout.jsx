import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Ticket, BarChart3, Lightbulb, Plus, Shield, Activity } from 'lucide-react';
import './Layout.css';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tickets', icon: Ticket, label: 'Tickets' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/insights', icon: Lightbulb, label: 'Insights' },
];

export default function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Shield size={18} />
          </div>
          <div>
            <div className="logo-name">SupportOps</div>
            <div className="logo-sub">Assistant v1.0</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Operations</div>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-actions">
          <NavLink to="/tickets/new" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}>
            <Plus size={15} />
            New Ticket
          </NavLink>
        </div>

        <div className="sidebar-footer">
          <div className="sys-status">
            <Activity size={12} className="status-dot-icon" />
            <span>All systems operational</span>
          </div>
          <div className="sidebar-env">ENV: PRODUCTION</div>
        </div>
      </aside>

      <div className="main-wrap">
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
