import { useEffect, useState } from 'react';
import { analyticsAPI, aiAPI } from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';
import { Brain, RefreshCw, TrendingUp, AlertTriangle, Sparkles, ChevronRight } from 'lucide-react';
import { SeverityBadge, StatusBadge } from '../components/ui/Badge';
import { formatRelativeTime } from '../utils/helpers';

export default function Insights() {
  const [insights, setInsights] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patternLoading, setPatternLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await analyticsAPI.getInsights();
        setInsights(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  const generatePatterns = async () => {
    setPatternLoading(true);
    try {
      const res = await aiAPI.getPatterns();
      setPatterns(res.data);
    } catch (err) { console.error(err); }
    finally { setPatternLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner message="Analyzing patterns..." /></div>;

  const riskColors = { High: 'text-red-400 bg-red-900/20 border-red-800/40', Medium: 'text-amber-400 bg-amber-900/20 border-amber-800/40', Low: 'text-green-400 bg-green-900/20 border-green-800/40' };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-white">Root Cause & Pattern Insights</h1>
          <p className="text-sm text-gray-500 font-mono mt-0.5">Systemic failure analysis and recurring issue detection</p>
        </div>
      </div>

      {/* Top Recurring Issues */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw size={14} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-gray-300">Top Recurring Issues</h2>
          </div>
          <span className="text-xs text-gray-600 font-mono">By occurrence count</span>
        </div>
        <div className="divide-y divide-surface-700">
          {insights?.topRecurring?.length === 0 && (
            <p className="text-sm text-gray-600 p-5">No recurring issues detected</p>
          )}
          {insights?.topRecurring?.map((issue, i) => (
            <Link key={issue.ticketId} to={`/tickets/${issue.ticketId}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-surface-700/20 transition-colors group">
              <span className="w-8 text-center text-lg font-display font-bold text-gray-600">#{i+1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 group-hover:text-white truncate">{issue.title}</p>
                <p className="text-xs text-gray-600 font-mono mt-0.5">{issue.category} · {issue.affectedService}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <SeverityBadge severity={issue.severity} showDot />
                <StatusBadge status={issue.status} />
                <span className="text-sm font-mono font-bold text-amber-400 bg-amber-900/20 w-12 text-center py-1 rounded border border-amber-800/40">×{issue.recurringCount}</span>
                <ChevronRight size={14} className="text-gray-600" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Escalation Rate by Category */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <TrendingUp size={14} className="text-red-400" />
          <h2 className="text-sm font-semibold text-gray-300">Escalation Rate by Category</h2>
        </div>
        <div className="p-5">
          <div className="space-y-3">
            {insights?.escalationRate?.map(cat => (
              <div key={cat._id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-400">{cat.category || cat._id}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 font-mono">{cat.escalated}/{cat.total} escalated</span>
                    <span className={`text-xs font-mono font-bold ${cat.escalationRate > 50 ? 'text-red-400' : cat.escalationRate > 25 ? 'text-amber-400' : 'text-green-400'}`}>
                      {Math.round(cat.escalationRate)}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-surface-600 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${cat.escalationRate > 50 ? 'bg-red-500' : cat.escalationRate > 25 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(cat.escalationRate, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Slowest Resolutions */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <AlertTriangle size={14} className="text-orange-400" />
            <h2 className="text-sm font-semibold text-gray-300">Longest Time-to-Resolve</h2>
          </div>
          <div className="divide-y divide-surface-700">
            {insights?.slowestResolution?.map(ticket => (
              <Link key={ticket.ticketId} to={`/tickets/${ticket.ticketId}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-700/20 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-300 group-hover:text-white truncate">{ticket.title}</p>
                  <p className="text-xs text-gray-600 font-mono">{ticket.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-bold text-orange-400">{Math.round(ticket.resolutionHours)}h</p>
                  <p className="text-xs text-gray-600 font-mono">{ticket.severity?.split(' - ')[0]}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Spike Categories */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <TrendingUp size={14} className="text-accent-cyan" />
            <h2 className="text-sm font-semibold text-gray-300">Category Spikes — Last 7 Days</h2>
          </div>
          <div className="p-4 space-y-2">
            {insights?.categoryTrends?.slice(0, 6).map((cat, i) => (
              <div key={cat._id} className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-700 w-5 text-right">{i+1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-gray-400">{cat._id}</span>
                    <span className="text-xs font-mono text-accent-cyan">{cat.count}</span>
                  </div>
                  <div className="h-1 bg-surface-600 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-cyan/60 rounded-full" style={{ width: `${(cat.count / (insights.categoryTrends[0]?.count || 1)) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Pattern Analysis */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-accent-cyan" />
            <h2 className="text-sm font-semibold text-gray-300">AI Systemic Pattern Analysis</h2>
          </div>
          <button onClick={generatePatterns} disabled={patternLoading} className="btn-secondary text-xs flex items-center gap-1.5 disabled:opacity-50">
            {patternLoading ? <><span className="w-3 h-3 border border-accent-cyan/50 border-t-accent-cyan rounded-full animate-spin" />Analyzing...</> : <><Brain size={11} />Analyze Patterns</>}
          </button>
        </div>

        {patternLoading && <div className="p-10 flex items-center justify-center"><LoadingSpinner message="AI is analyzing recurring patterns..." /></div>}
        {!patternLoading && !patterns && (
          <div className="p-10 text-center">
            <Brain size={28} className="text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Click "Analyze Patterns" to detect systemic failure clusters</p>
            <p className="text-xs text-gray-700 mt-1">Uses Claude to group recurring issues and suggest structural fixes</p>
          </div>
        )}
        {!patternLoading && patterns?.patterns && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            {patterns.patterns.map((p, i) => (
              <div key={i} className={`rounded-lg border p-4 ${riskColors[p.riskLevel] || 'text-gray-400 bg-surface-700 border-surface-500'}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold">{p.pattern}</h3>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded border ${riskColors[p.riskLevel]}`}>{p.riskLevel}</span>
                </div>
                <p className="text-xs opacity-70 mb-2 font-mono">Frequency: {p.frequency}</p>
                <div className="text-xs opacity-70 mb-3">
                  <p className="font-mono text-xs mb-1">Affected tickets:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {p.tickets?.map((t, j) => <li key={j} className="truncate">{t}</li>)}
                  </ul>
                </div>
                <div className="border-t border-current/20 pt-3">
                  <p className="text-xs font-mono opacity-50 mb-1">RECOMMENDATION</p>
                  <p className="text-xs opacity-80 leading-relaxed">{p.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
