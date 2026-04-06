import { useEffect, useState, useCallback } from 'react';
import { Plus, Filter, SlidersHorizontal, X, AlertTriangle } from 'lucide-react';
import { ticketsAPI } from '../services/api';
import TicketCard from '../components/TicketCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import CreateTicketModal from '../components/CreateTicketModal';
import { CATEGORIES, TEAMS, SEVERITIES, STATUSES, SOURCES } from '../utils/constants';

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: '', severity: '', category: '', assignedTeam: '', isEscalated: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, sortBy, sortOrder: 'desc', ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '')) };
      const res = await ticketsAPI.getAll(params);
      setTickets(res.data);
      setPagination(res.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters, page, sortBy]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const clearFilters = () => {
    setFilters({ status: '', severity: '', category: '', assignedTeam: '', isEscalated: '' });
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-display font-bold text-white">Ticket Queue</h1>
          <p className="text-sm text-gray-500 font-mono mt-0.5">{pagination.total} total tickets</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${activeFilterCount > 0 ? 'border-accent-cyan/40 text-accent-cyan' : ''}`}>
            <SlidersHorizontal size={13} />
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
          <div className="flex items-center gap-1 bg-surface-800 border border-surface-600 rounded-md p-1">
            {[['createdAt', 'Newest'], ['severity', 'Severity'], ['status', 'Status']].map(([val, label]) => (
              <button key={val} onClick={() => { setSortBy(val); setPage(1); }}
                className={`text-xs px-3 py-1.5 rounded font-mono transition-colors ${sortBy === val ? 'bg-surface-600 text-gray-200' : 'text-gray-600 hover:text-gray-400'}`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={14} />New Ticket
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="card p-4 mb-5 animate-slide-up">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <FilterSelect label="Status" value={filters.status} onChange={v => setFilters(f => ({ ...f, status: v }))} options={STATUSES} />
            <FilterSelect label="Severity" value={filters.severity} onChange={v => setFilters(f => ({ ...f, severity: v }))} options={SEVERITIES} />
            <FilterSelect label="Category" value={filters.category} onChange={v => setFilters(f => ({ ...f, category: v }))} options={CATEGORIES} />
            <FilterSelect label="Team" value={filters.assignedTeam} onChange={v => setFilters(f => ({ ...f, assignedTeam: v }))} options={TEAMS} />
            <FilterSelect label="Escalated" value={filters.isEscalated} onChange={v => setFilters(f => ({ ...f, isEscalated: v }))} options={[['true', 'Yes'], ['false', 'No']]} />
          </div>
          {activeFilterCount > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 font-mono">
                <X size={11} />Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Escalated Alert */}
      {filters.isEscalated === '' && (
        <EscalatedBanner onView={() => setFilters(f => ({ ...f, isEscalated: 'true', status: '' }))} />
      )}

      {/* Tickets Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64"><LoadingSpinner message="Loading tickets..." /></div>
      ) : tickets.length === 0 ? (
        <EmptyState icon="🎯" title="No tickets found" description="Try adjusting your filters or creating a new ticket." action={<button onClick={clearFilters} className="btn-secondary text-xs">Clear Filters</button>} />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {tickets.map(ticket => <TicketCard key={ticket._id} ticket={ticket} />)}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <span className="text-xs text-gray-600 font-mono">Page {pagination.page} of {pagination.pages}</span>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-xs disabled:opacity-40">← Prev</button>
            <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-xs disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}

      {showModal && <CreateTicketModal onClose={() => setShowModal(false)} onCreated={fetchTickets} />}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs text-gray-600 font-mono block mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="select text-xs">
        <option value="">All</option>
        {options.map(opt => typeof opt === 'string'
          ? <option key={opt} value={opt}>{opt}</option>
          : <option key={opt[0]} value={opt[0]}>{opt[1]}</option>
        )}
      </select>
    </div>
  );
}

function EscalatedBanner({ onView }) {
  const [count, setCount] = useState(null);
  useEffect(() => {
    ticketsAPI.getAll({ isEscalated: 'true', status: 'Escalated', limit: 1 })
      .then(r => setCount(r.pagination.total)).catch(() => {});
  }, []);
  if (!count) return null;
  return (
    <div className="mb-4 flex items-center gap-3 bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-3">
      <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
      <span className="text-sm text-red-300"><strong>{count} escalated ticket{count !== 1 ? 's' : ''}</strong> require immediate attention</span>
      <button onClick={onView} className="ml-auto text-xs text-red-400 hover:text-red-300 font-mono underline">View Escalated</button>
    </div>
  );
}
