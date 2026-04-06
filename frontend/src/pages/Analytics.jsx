import { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, AlertCircle } from 'lucide-react';
import { CATEGORY_ICONS } from '../utils/constants';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface-800 border border-surface-600 rounded-lg p-3 text-xs shadow-xl">
        <p className="font-mono text-gray-400 mb-2 border-b border-surface-600 pb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-mono py-0.5">{p.name}: <strong>{typeof p.value === 'number' ? (Number.isInteger(p.value) ? p.value : p.value.toFixed(1)) : p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await analyticsAPI.getDashboard({ days: period });
        setStats(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [period]);

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner message="Crunching numbers..." /></div>;

  const dailyData = stats?.dailyVolume?.map(d => ({
    date: d._id?.slice(5),
    Created: d.count,
    Resolved: d.resolved,
    Escalated: d.escalated,
    Backlog: d.count - d.resolved
  })) || [];

  const categoryData = stats?.categoryBreakdown?.map(c => ({
    name: CATEGORY_ICONS[c._id] + ' ' + (c._id?.split(' / ')[0] || c._id),
    count: c.count,
    fullName: c._id
  })) || [];

  const teamData = stats?.teamBreakdown?.map(t => ({
    name: t._id,
    Total: t.count,
    Resolved: t.resolved,
    'Resolution %': t.count > 0 ? Math.round((t.resolved / t.count) * 100) : 0
  })) || [];

  const responseData = stats?.avgResponseTime?.map(r => ({
    severity: r._id?.split(' - ')[0] || r._id,
    'Avg Response (min)': Math.round(r.avgMinutes),
    count: r.count
  })) || [];

  const totalTickets = stats?.statusBreakdown?.reduce((s, i) => s + i.count, 0) || 0;
  const resolvedCount = stats?.statusBreakdown?.find(s => s._id === 'Resolved')?.count || 0;
  const resolutionRate = totalTickets > 0 ? Math.round((resolvedCount / totalTickets) * 100) : 0;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-white">Analytics</h1>
          <p className="text-sm text-gray-500 font-mono mt-0.5">Performance metrics & resolution trends</p>
        </div>
        <div className="flex items-center gap-1 bg-surface-800 border border-surface-600 rounded-md p-1">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setPeriod(d)}
              className={`text-xs px-3 py-1.5 rounded font-mono transition-colors ${period === d ? 'bg-accent-cyan text-surface-950 font-bold' : 'text-gray-500 hover:text-gray-300'}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <AnalyticKpi label="Resolution Rate" value={`${resolutionRate}%`} sub="All time" icon={<TrendingUp size={14} />} color="text-emerald-400" />
        <AnalyticKpi label="Avg Resolution" value={stats?.kpis?.avgResolutionHours ? `${stats.kpis.avgResolutionHours}h` : '—'} sub={`${period}d period`} icon={<BarChart3 size={14} />} color="text-accent-cyan" />
        <AnalyticKpi label="New Tickets" value={stats?.kpis?.recentTickets} sub={`Last ${period} days`} icon={<AlertCircle size={14} />} color="text-amber-400" />
        <AnalyticKpi label="Total Open" value={stats?.kpis?.totalOpen} sub="Currently in queue" icon={<TrendingDown size={14} />} color="text-sky-400" />
      </div>

      {/* Volume Over Time */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300">Ticket Lifecycle — Created vs Resolved ({period}d)</h2>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dailyData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <defs>
                <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#39d353" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#39d353" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#1c2230" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#4b5563', fontFamily: 'IBM Plex Mono' }} />
              <YAxis tick={{ fontSize: 10, fill: '#4b5563', fontFamily: 'IBM Plex Mono' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontFamily: 'IBM Plex Mono', color: '#6b7280' }} />
              <Area type="monotone" dataKey="Created" stroke="#00d4ff" fill="url(#gradCreated)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Resolved" stroke="#39d353" fill="url(#gradResolved)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Escalated" stroke="#ff4757" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-300">Issues by Category</h2>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#1c2230" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#4b5563', fontFamily: 'IBM Plex Mono' }} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 9, fill: '#6b7280', fontFamily: 'IBM Plex Mono' }} />
                <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #2d3748', fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                <Bar dataKey="count" fill="#4a9eff" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={`hsl(${200 + i * 15}, 70%, ${50 + i * 2}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Time by Severity */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-300">Avg Response Time by Severity (min)</h2>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={responseData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#1c2230" />
                <XAxis dataKey="severity" tick={{ fontSize: 11, fill: '#6b7280', fontFamily: 'IBM Plex Mono' }} />
                <YAxis tick={{ fontSize: 10, fill: '#4b5563', fontFamily: 'IBM Plex Mono' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Avg Response (min)" radius={[4, 4, 0, 0]}>
                  {responseData.map((_, i) => (
                    <Cell key={i} fill={['#ff4757', '#f0a500', '#ecc94b', '#39d353'][i] || '#4a9eff'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-gray-300">Team Performance</h2>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={teamData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1c2230" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280', fontFamily: 'IBM Plex Mono' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#4b5563', fontFamily: 'IBM Plex Mono' }} />
              <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fontSize: 10, fill: '#4b5563', fontFamily: 'IBM Plex Mono' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontFamily: 'IBM Plex Mono', color: '#6b7280' }} />
              <Bar yAxisId="left" dataKey="Total" fill="#2d3d5a" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="Resolved" fill="#39d353" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="Resolution %" stroke="#f0a500" strokeWidth={2} dot={{ fill: '#f0a500', r: 3 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-gray-300">Status Distribution</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {stats?.statusBreakdown?.map(s => {
              const pct = totalTickets > 0 ? Math.round((s.count / totalTickets) * 100) : 0;
              return (
                <div key={s._id} className="text-center p-3 bg-surface-700 rounded-lg border border-surface-600">
                  <div className="text-xl font-display font-bold text-white mb-1">{s.count}</div>
                  <div className="text-xs text-gray-500 mb-1">{s._id}</div>
                  <div className="text-xs font-mono text-gray-600">{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticKpi({ label, value, sub, icon, color }) {
  return (
    <div className="stat-card">
      <div className={`${color} mb-3`}>{icon}</div>
      <div className={`text-2xl font-display font-bold ${color} mb-1`}>{value ?? '—'}</div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-xs text-gray-600 font-mono mt-0.5">{sub}</div>
    </div>
  );
}
