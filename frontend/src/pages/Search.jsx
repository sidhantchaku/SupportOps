import { useState, useCallback } from 'react';
import { Search, X, Clock, Tag } from 'lucide-react';
import { ticketsAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { SeverityBadge, StatusBadge } from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatRelativeTime } from '../utils/helpers';
import { CATEGORIES, STATUSES } from '../utils/constants';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const doSearch = useCallback(async (q) => {
    if (!q || q.length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await ticketsAPI.search({ q, ...(catFilter && { category: catFilter }), ...(statusFilter && { status: statusFilter }) });
      setResults(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [catFilter, statusFilter]);

  const handleKeyDown = (e) => { if (e.key === 'Enter') doSearch(query); };

  const QUICK_SEARCHES = ['OAuth token refresh', 'payment webhook', 'database timeout', 'data sync delay', 'nginx 413', 'stripe', 'replication lag'];

  return (
    <div className="p-6 animate-fade-in max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-display font-bold text-white">Issue History Search</h1>
        <p className="text-sm text-gray-500 font-mono mt-0.5">Search past tickets, incidents, and resolutions</p>
      </div>

      {/* Search Box */}
      <div className="card p-5 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              className="input pl-9 text-base h-11"
              placeholder="Search tickets by title, description, service, tags..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                <X size={14} />
              </button>
            )}
          </div>
          <button onClick={() => doSearch(query)} className="btn-primary h-11 px-5">Search</button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="select text-xs w-auto flex-shrink-0">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select text-xs w-auto flex-shrink-0">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Quick searches */}
        {!searched && (
          <div className="mt-4">
            <p className="text-xs text-gray-600 font-mono mb-2">Quick searches:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SEARCHES.map(qs => (
                <button key={qs} onClick={() => { setQuery(qs); doSearch(qs); }}
                  className="text-xs text-gray-500 hover:text-accent-cyan bg-surface-700 hover:bg-accent-cyan/10 border border-surface-500 hover:border-accent-cyan/30 px-2.5 py-1 rounded font-mono transition-colors">
                  {qs}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading && <div className="flex justify-center py-12"><LoadingSpinner message="Searching..." /></div>}

      {!loading && searched && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 font-mono">
              {results.length === 0 ? 'No results' : `${results.length} result${results.length !== 1 ? 's' : ''}`} for "<span className="text-gray-300">{query}</span>"
            </p>
          </div>

          {results.length === 0 ? (
            <div className="card p-12 text-center">
              <Search size={24} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No tickets found matching your query</p>
              <p className="text-gray-700 text-xs font-mono mt-1">Try different keywords or broader search terms</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map(ticket => (
                <Link key={ticket._id} to={`/tickets/${ticket.ticketId}`}
                  className="card flex items-start gap-4 p-4 hover:border-surface-500 hover:bg-surface-700/20 transition-all group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs text-gray-600">{ticket.ticketId}</span>
                      <span className="text-xs text-gray-600">·</span>
                      <span className="text-xs text-gray-500">{ticket.category}</span>
                      {ticket.affectedService && (
                        <><span className="text-xs text-gray-600">·</span>
                        <span className="text-xs text-gray-600 font-mono">{ticket.affectedService}</span></>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-gray-300 group-hover:text-white leading-snug mb-2">{ticket.title}</h3>
                    {ticket.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {ticket.tags.slice(0, 5).map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <SeverityBadge severity={ticket.severity} showDot />
                    <StatusBadge status={ticket.status} />
                    <span className="text-xs text-gray-700 font-mono flex items-center gap-1">
                      <Clock size={9} />
                      {formatRelativeTime(ticket.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {!searched && (
        <div className="card p-12 text-center">
          <Search size={32} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">Search across all historical tickets and incidents</p>
          <p className="text-gray-700 text-xs font-mono mt-1.5">Find previous resolutions, recurring patterns, and related issues</p>
        </div>
      )}
    </div>
  );
}
