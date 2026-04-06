import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, RefreshCw, Sparkles, Clock, Users, CheckCircle, ChevronRight, Edit2, X, Save, ExternalLink } from 'lucide-react';
import { ticketsAPI, aiAPI } from '../services/api';
import { SeverityBadge, StatusBadge, Tag } from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDateTime, formatRelativeTime, calcResponseTime, calcResolutionTime } from '../utils/helpers';
import { STATUSES, TEAMS, CATEGORY_ICONS } from '../utils/constants';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => { fetchTicket(); }, [id]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await ticketsAPI.getById(id);
      setTicket(res.data);
      setRelated(res.related || []);
      setEditData({ status: res.data.status, assignedTeam: res.data.assignedTeam, severity: res.data.severity });
    } catch { navigate('/tickets'); }
    finally { setLoading(false); }
  };

  const generateAI = async () => {
    setAiLoading(true);
    try {
      await aiAPI.generateSummary(id);
      await fetchTicket();
    } catch (err) { console.error(err); }
    finally { setAiLoading(false); }
  };

  const saveEdits = async () => {
    setSaveLoading(true);
    try {
      await ticketsAPI.update(id, { ...editData, notes, updatedBy: 'engineer@supportops.io' });
      await fetchTicket();
      setEditing(false);
      setNotes('');
    } catch (err) { console.error(err); }
    finally { setSaveLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><LoadingSpinner message="Loading ticket..." /></div>;
  if (!ticket) return null;

  const statusOptions = STATUSES;
  const teamOptions = TEAMS;

  return (
    <div className="p-6 max-w-7xl animate-fade-in">
      {/* Back */}
      <Link to="/tickets" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-5 transition-colors font-mono">
        <ArrowLeft size={14} />Back to Queue
      </Link>

      {/* Header */}
      <div className="card p-5 mb-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="font-mono text-sm text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded border border-accent-cyan/20">{ticket.ticketId}</span>
              {ticket.isEscalated && (
                <span className="inline-flex items-center gap-1.5 text-xs text-red-400 font-mono bg-red-900/20 px-2 py-0.5 rounded border border-red-800/40">
                  <AlertTriangle size={10} />ESCALATED
                </span>
              )}
              {ticket.isRecurring && (
                <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-mono bg-amber-900/20 px-2 py-0.5 rounded border border-amber-800/40">
                  <RefreshCw size={10} />RECURRING ×{ticket.recurringCount}
                </span>
              )}
              <span className="text-xs text-gray-600 font-mono ml-auto">{formatDateTime(ticket.createdAt)}</span>
            </div>
            <h1 className="text-lg font-display font-bold text-white leading-snug">{ticket.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
              <span>{CATEGORY_ICONS[ticket.category]} {ticket.category}</span>
              <span>·</span>
              <span className="font-mono">{ticket.affectedService}</span>
              <span>·</span>
              <span>{ticket.environment}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <SeverityBadge severity={ticket.severity} showDot />
            <StatusBadge status={ticket.status} />
            <button onClick={() => setEditing(!editing)} className={`btn-secondary text-xs flex items-center gap-1.5 ${editing ? 'text-amber-400 border-amber-800/50' : ''}`}>
              {editing ? <><X size={11} />Cancel</> : <><Edit2 size={11} />Edit</>}
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 border-y border-surface-700">
          <Metric label="Source" value={ticket.source} />
          <Metric label="Assigned Team" value={ticket.assignedTeam} mono />
          <Metric label="Affected Users" value={ticket.affectedUsers?.toLocaleString() || '—'} />
          <Metric label="Response Time" value={calcResponseTime(ticket.createdAt, ticket.firstResponseAt) || '—'} />
          <Metric label="Reported By" value={ticket.reportedBy} mono small />
          <Metric label="Assigned To" value={ticket.assignedEngineer || 'Unassigned'} mono small />
          <Metric label="Resolution Time" value={calcResolutionTime(ticket.createdAt, ticket.resolvedAt) || 'Open'} />
          <Metric label="Last Updated" value={formatRelativeTime(ticket.updatedAt)} small />
        </div>

        {/* Tags */}
        {ticket.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {ticket.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="col-span-2 space-y-5">
          {/* Edit Panel */}
          {editing && (
            <div className="card p-5 border-amber-800/40 animate-slide-up">
              <h3 className="text-sm font-semibold text-amber-400 mb-4 flex items-center gap-2"><Edit2 size={13} />Edit Ticket</h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-xs text-gray-600 font-mono block mb-1">Status</label>
                  <select className="select text-xs" value={editData.status} onChange={e => setEditData(d => ({ ...d, status: e.target.value }))}>
                    {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-mono block mb-1">Team</label>
                  <select className="select text-xs" value={editData.assignedTeam} onChange={e => setEditData(d => ({ ...d, assignedTeam: e.target.value }))}>
                    {teamOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-mono block mb-1">Escalate</label>
                  <select className="select text-xs" value={editData.isEscalated ? 'true' : 'false'} onChange={e => setEditData(d => ({ ...d, isEscalated: e.target.value === 'true' }))}>
                    <option value="false">No</option>
                    <option value="true">Yes — Escalate</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-mono block mb-1">Update Notes (optional)</label>
                <textarea className="input text-xs resize-none h-16 font-mono" placeholder="Add context to this update..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div className="flex justify-end mt-3">
                <button onClick={saveEdits} disabled={saveLoading} className="btn-primary flex items-center gap-2 text-xs">
                  <Save size={12} />{saveLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="card">
            <div className="card-header"><h3 className="text-sm font-semibold text-gray-300">Issue Description</h3></div>
            <div className="p-5">
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
              {ticket.resolutionNotes && (
                <div className="mt-4 p-3 bg-emerald-900/10 border border-emerald-800/30 rounded-md">
                  <p className="text-xs font-mono text-emerald-400 mb-1">RESOLUTION NOTES</p>
                  <p className="text-sm text-gray-300">{ticket.resolutionNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Summary */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-accent-cyan" />
                <h3 className="text-sm font-semibold text-gray-300">AI-Assisted Analysis</h3>
              </div>
              <button onClick={generateAI} disabled={aiLoading} className="btn-secondary text-xs flex items-center gap-1.5 disabled:opacity-50">
                {aiLoading ? <><span className="w-3 h-3 border border-accent-cyan/50 border-t-accent-cyan rounded-full animate-spin" />Generating...</> : <><Sparkles size={11} />Generate</>}
              </button>
            </div>
            {aiLoading && (
              <div className="p-8 flex items-center justify-center"><LoadingSpinner message="Analyzing ticket with Claude..." /></div>
            )}
            {!aiLoading && !ticket.aiSummary && (
              <div className="p-8 text-center">
                <Sparkles size={24} className="text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Click Generate to get AI-powered root cause analysis</p>
                <p className="text-xs text-gray-700 mt-1">Uses Claude to analyze symptoms and suggest resolution paths</p>
              </div>
            )}
            {!aiLoading && ticket.aiSummary && (
              <div className="p-5 space-y-4 animate-fade-in">
                <div>
                  <p className="text-xs font-mono text-accent-cyan uppercase tracking-wider mb-2">Summary</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{ticket.aiSummary.summary}</p>
                </div>
                <div className="border-t border-surface-700 pt-4">
                  <p className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-2">Probable Root Cause</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{ticket.aiSummary.rootCause}</p>
                </div>
                <div className="border-t border-surface-700 pt-4">
                  <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-2">Suggested Next Steps</p>
                  <ol className="space-y-2">
                    {ticket.aiSummary.suggestedSteps?.map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <span className="w-5 h-5 rounded-full bg-surface-600 text-gray-500 text-xs flex items-center justify-center flex-shrink-0 font-mono mt-0.5">{i+1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                <p className="text-xs text-gray-700 font-mono pt-2">Generated {formatRelativeTime(ticket.aiSummary.generatedAt)}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="card-header"><h3 className="text-sm font-semibold text-gray-300">Activity Timeline</h3></div>
            <div className="p-5">
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-surface-600" />
                <div className="space-y-5">
                  {[...ticket.timeline].reverse().map((event, i) => (
                    <div key={i} className="flex items-start gap-4 relative">
                      <div className="w-6 h-6 rounded-full bg-surface-700 border border-surface-500 flex items-center justify-center flex-shrink-0 relative z-10">
                        <span className="w-2 h-2 rounded-full bg-accent-cyan/60 inline-block" />
                      </div>
                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-gray-300">{event.action}</span>
                          <span className="text-xs text-gray-600 font-mono">by {event.actor}</span>
                          <span className="text-xs text-gray-700 font-mono ml-auto">{formatDateTime(event.timestamp)}</span>
                        </div>
                        {event.details && <p className="text-xs text-gray-500 mt-1">{event.details}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Related Tickets */}
          {related.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-sm font-semibold text-gray-300">Related Tickets</h3>
                <p className="text-xs text-gray-600 mt-0.5">Same category, currently open</p>
              </div>
              <div className="divide-y divide-surface-700">
                {related.map(rel => (
                  <Link key={rel.ticketId} to={`/tickets/${rel.ticketId}`} className="block px-4 py-3 hover:bg-surface-700/30 transition-colors group">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-mono text-xs text-gray-600">{rel.ticketId}</span>
                      <SeverityBadge severity={rel.severity} />
                    </div>
                    <p className="text-xs text-gray-400 group-hover:text-gray-300 leading-snug">{rel.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StatusBadge status={rel.status} />
                      <span className="text-xs text-gray-700 font-mono">{formatRelativeTime(rel.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="card p-4 space-y-3">
            <h3 className="text-xs font-mono text-gray-600 uppercase tracking-wider">Ticket Metadata</h3>
            <MetaRow label="Created" value={formatDateTime(ticket.createdAt)} />
            <MetaRow label="First Response" value={ticket.firstResponseAt ? formatDateTime(ticket.firstResponseAt) : '—'} />
            <MetaRow label="Resolved" value={ticket.resolvedAt ? formatDateTime(ticket.resolvedAt) : 'Pending'} />
            <MetaRow label="Response SLA" value={calcResponseTime(ticket.createdAt, ticket.firstResponseAt) || '—'} />
            <MetaRow label="Resolution Time" value={calcResolutionTime(ticket.createdAt, ticket.resolvedAt) || 'Open'} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, mono, small }) {
  return (
    <div>
      <p className="text-xs text-gray-600 mb-0.5">{label}</p>
      <p className={`text-sm text-gray-300 font-medium ${mono ? 'font-mono text-xs' : ''} ${small ? 'text-xs' : ''} truncate`}>{value}</p>
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-gray-600">{label}</span>
      <span className="text-xs text-gray-400 font-mono text-right">{value}</span>
    </div>
  );
}
