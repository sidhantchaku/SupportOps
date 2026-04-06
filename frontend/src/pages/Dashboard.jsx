import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, TrendingUp, CheckCircle2, Zap, ArrowRight, RefreshCw } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { analyticsAPI, ticketsAPI } from '../services/api';
import { SeverityBadge, StatusBadge } from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatRelativeTime, formatDateTime } from '../utils/helpers';
import { CATEGORY_ICONS } from '../utils/constants';

const PIE_COLORS = ['#ff4757', '#f0a500', '#ecc94b', '#39d353'];
const STATUS_COLORS = { 'Open': '#38bdf8', 'In Progress': '#4a9eff', 'Pending Review': '#9b59b6', 'Escalated': '#ff4757', 'Resolved': '#39d353', 'Closed': '#4b5563' };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-800 border border-surface-600 rounded-lg p-3 text-xs shadow-lg">
        <p className="font-mono text-gray-400 mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-mono">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsData, ticketsData] = await Promise.all([
        analyticsAPI.getDashboard({ days: period }),
        ticketsAPI.getAll({ sortBy: 'createdAt', sortOrder: 'desc', limit: 8, status: 'Open' })
      ]);
      setStats(analyticsData.data);
      setRecentTickets(ticketsData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><LoadingSpinner message="Loading dashboard..." /></div>;
  }

  const severityData = stats?.severityBreakdown?.map(s => ({
    name: s._id?.replace(' - ', '\n') || 'Unknown',
    value: s.count,
    fullName: s._id
  })) || [];

  const dailyData = stats?.dailyVolume?.slice(-14).map(d => ({
    date: d._id?.slice(5) || '',
    Created: d.count,
    Resolved: d.resolved,
    Escalated: d.escalated
  })) || [];

  const categoryData = stats?.categoryBreakdown?.slice(0, 6).map(c => ({
    name: c._id?.split(' / ')[0]?.split(' ').slice(0, 2).join(' ') || 'Other',
    count: c.count,
    icon: CATEGORY_ICONS[c._id] || '🔧'
  })) || [];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-white">Operations Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5 font-mono">Real-time support engineering overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-surface-800 border border-surface-600 rounded-md p-1">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setPeriod(d)}
                className={`text-xs px-3 py-1.5 rounded font-mono transition-colors ${period === d ? 'bg-accent-cyan text-surface-950 font-bold' : 'text-gray-500 hover:text-gray-300'}`}>
                {d}d
              </button>
            ))}
          </div>
          <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={13} />Refresh
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={<AlertTriangle size={16} className="text-red-400" />} label="Critical Open" value={stats?.kpis?.totalCritical} color="text-red-400" trend="urgent" />
        <KpiCard icon={<Zap size={16} className="text-orange-400" />} label="Escalated" value={stats?.kpis?.totalEscalated} color="text-orange-400" />
        <KpiCard icon={<Clock size={16} className="text-sky-400" />} label="Open Queue" value={stats?.kpis?.totalOpen} color="text-sky-400" />
        <KpiCard icon={<CheckCircle2 size={16} className="text-emerald-400" />} label={`Resolved (${period}d)`} value={stats?.kpis?.resolvedInPeriod} color="text-emerald-400" sub={stats?.kpis?.avgResolutionHours ? `Avg ${stats.kpis.avgResolutionHours}h TTR` : null} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-3 gap-4">
        {/* Ticket Volume Chart */}
        <div className="col-span-2 card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-300">Ticket Volume — Last 14 Days</h2>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent-cyan inline-block" />Created</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Resolved</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Escalated</span>
            </div>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#39d353" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#39d353" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#1c2230" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4b5563', fontFamily: 'IBM Plex Mono' }} />
                <YAxis tick={{ fontSize: 10, fill: '#4b5563', fontFamily: 'IBM Plex Mono' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Created" stroke="#00d4ff" fill="url(#colorCreated)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="Resolved" stroke="#39d353" fill="url(#colorResolved)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="Escalated" stroke="#ff4757" fill="none" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-300">By Severity</h2>
          </div>
          <div className="p-5 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={severityData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {severityData.map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name, props) => [val, props.payload.fullName]} contentStyle={{ background: '#161b22', border: '1px solid #2d3748', fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-2 mt-2">
              {severityData.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-gray-500 font-mono">{s.fullName?.split(' - ')[0]}</span>
                  </span>
                  <span className="font-mono text-gray-300">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-3 gap-4">
        {/* Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-300">Top Categories ({period}d)</h2>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#1c2230" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#4b5563', fontFamily: 'IBM Plex Mono' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#6b7280', fontFamily: 'IBM Plex Mono' }} width={80} />
                <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #2d3748', fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                <Bar dataKey="count" fill="#4a9eff" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recurring Issues */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-300">Recurring Issues</h2>
            <RefreshCw size={12} className="text-amber-400" />
          </div>
          <div className="divide-y divide-surface-700">
            {stats?.recurringIssues?.length === 0 && (
              <p className="text-xs text-gray-600 p-5">No recurring issues detected</p>
            )}
            {stats?.recurringIssues?.map(issue => (
              <Link key={issue.ticketId} to={`/tickets/${issue.ticketId}`}
                className="block px-4 py-3 hover:bg-surface-700/30 transition-colors">
                <div className="flex items-start gap-2">
                  <span className="text-amber-400 font-mono text-xs bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-800/40 flex-shrink-0">×{issue.recurringCount}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-300 truncate">{issue.title}</p>
                    <p className="text-xs text-gray-600 font-mono mt-0.5">{issue.category}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Team Workload */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-300">Team Workload</h2>
          </div>
          <div className="p-4 space-y-3">
            {stats?.teamBreakdown?.slice(0, 6).map(team => {
              const pct = team.count > 0 ? Math.round((team.resolved / team.count) * 100) : 0;
              return (
                <div key={team._id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 font-mono">{team._id}</span>
                    <span className="text-xs text-gray-600 font-mono">{team.count} tickets</span>
                  </div>
                  <div className="h-1.5 bg-surface-600 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-cyan rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5 font-mono">{pct}% resolved</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Open Tickets */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300">Open Tickets — Oldest First</h2>
          <Link to="/tickets" className="text-xs text-accent-cyan hover:text-cyan-300 font-mono flex items-center gap-1">
            View all <ArrowRight size={11} />
          </Link>
        </div>
        <div className="divide-y divide-surface-700">
          {recentTickets.map(ticket => (
            <Link key={ticket._id} to={`/tickets/${ticket.ticketId}`}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-700/30 transition-colors group">
              <span className="font-mono text-xs text-gray-600 w-24 flex-shrink-0">{ticket.ticketId}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 truncate group-hover:text-white">{ticket.title}</p>
                <p className="text-xs text-gray-600 font-mono mt-0.5">{ticket.category} · {ticket.assignedTeam}</p>
              </div>
              <SeverityBadge severity={ticket.severity} showDot />
              <StatusBadge status={ticket.status} />
              <span className="text-xs text-gray-600 font-mono w-24 text-right flex-shrink-0">{formatRelativeTime(ticket.createdAt)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, color, sub, trend }) {
  return (
    <div className={`stat-card ${trend === 'urgent' && value > 0 ? 'border-red-800/50' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-surface-700 rounded-md">{icon}</div>
        {trend === 'urgent' && value > 0 && (
          <span className="text-xs text-red-400 font-mono animate-pulse">LIVE</span>
        )}
      </div>
      <div className={`text-3xl font-display font-bold ${color} mb-1`}>{value ?? '—'}</div>
      <div className="text-xs text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-600 font-mono mt-1">{sub}</div>}
    </div>
  );
}
