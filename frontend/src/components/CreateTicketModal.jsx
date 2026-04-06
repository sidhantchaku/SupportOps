import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { ticketsAPI } from '../services/api';
import { CATEGORIES, TEAMS, SEVERITIES, SOURCES } from '../utils/constants';

export default function CreateTicketModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', category: '', severity: 'P2 - Medium',
    source: 'Customer Portal', assignedTeam: 'Unassigned', reportedBy: '',
    affectedService: '', affectedUsers: 0, environment: 'Production', tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setError('');
    if (!form.title || !form.description || !form.category || !form.reportedBy) {
      setError('Please fill in all required fields'); return;
    }
    setLoading(true);
    try {
      await ticketsAPI.create({
        ...form,
        affectedUsers: parseInt(form.affectedUsers) || 0,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-800 border border-surface-600 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-600">
          <div>
            <h2 className="font-display font-bold text-white">Create New Ticket</h2>
            <p className="text-xs text-gray-600 font-mono mt-0.5">All fields marked * are required</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-700 rounded-md transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/50 text-red-400 px-3 py-2.5 rounded-md text-sm">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          <Field label="Title *">
            <input className="input" placeholder="Brief description of the issue" value={form.title} onChange={e => set('title', e.target.value)} />
          </Field>

          <Field label="Description *">
            <textarea className="input min-h-[120px] resize-none" placeholder="Detailed description including symptoms, affected services, timeline, and any relevant error messages..." value={form.description} onChange={e => set('description', e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category *">
              <select className="select" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Severity *">
              <select className="select" value={form.severity} onChange={e => set('severity', e.target.value)}>
                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Source">
              <select className="select" value={form.source} onChange={e => set('source', e.target.value)}>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Assigned Team">
              <select className="select" value={form.assignedTeam} onChange={e => set('assignedTeam', e.target.value)}>
                {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Reported By *">
              <input className="input" placeholder="email@company.com" value={form.reportedBy} onChange={e => set('reportedBy', e.target.value)} />
            </Field>
            <Field label="Affected Service">
              <input className="input" placeholder="service-name v1.0" value={form.affectedService} onChange={e => set('affectedService', e.target.value)} />
            </Field>
            <Field label="Affected Users">
              <input type="number" className="input" placeholder="0" value={form.affectedUsers} onChange={e => set('affectedUsers', e.target.value)} />
            </Field>
            <Field label="Environment">
              <select className="select" value={form.environment} onChange={e => set('environment', e.target.value)}>
                {['Production', 'Staging', 'Development'].map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Tags (comma-separated)">
            <input className="input font-mono text-xs" placeholder="api-failure, timeout, auth-service" value={form.tags} onChange={e => set('tags', e.target.value)} />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-600">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-mono text-gray-500 block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
