import { Link } from 'react-router-dom';
import { Clock, Users, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { SeverityBadge, StatusBadge } from './ui/Badge';
import { formatRelativeTime, truncate } from '../utils/helpers';
import { CATEGORY_ICONS } from '../utils/constants';

export default function TicketCard({ ticket }) {
  return (
    <Link
      to={`/tickets/${ticket.ticketId}`}
      className="block card hover:border-surface-500 transition-all duration-150 hover:bg-surface-700/30 animate-fade-in group"
    >
      <div className="px-5 py-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs text-gray-600">{ticket.ticketId}</span>
              {ticket.isEscalated && (
                <span className="inline-flex items-center gap-1 text-xs text-red-400 font-mono bg-red-900/20 px-1.5 py-0.5 rounded border border-red-800/40">
                  <AlertTriangle size={9} />ESC
                </span>
              )}
              {ticket.isRecurring && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-mono bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-800/40">
                  <RefreshCw size={9} />×{ticket.recurringCount}
                </span>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-200 leading-snug group-hover:text-white transition-colors">
              {truncate(ticket.title, 90)}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <SeverityBadge severity={ticket.severity} showDot />
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <span>{CATEGORY_ICONS[ticket.category] || '🔧'}</span>
            <span className="text-gray-500">{ticket.category}</span>
          </span>
          {ticket.affectedService && (
            <span className="font-mono text-gray-600 truncate max-w-32">{ticket.affectedService}</span>
          )}
          {ticket.affectedUsers > 0 && (
            <span className="flex items-center gap-1">
              <Users size={10} />
              {ticket.affectedUsers.toLocaleString()}
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Clock size={10} />
            {formatRelativeTime(ticket.createdAt)}
          </span>
        </div>

        {/* Team assignment */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-700">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Team:</span>
            <span className="text-xs font-mono text-gray-400 bg-surface-700 px-2 py-0.5 rounded">{ticket.assignedTeam}</span>
          </div>
          {ticket.assignedEngineer && (
            <span className="text-xs text-gray-600 font-mono truncate max-w-32">{ticket.assignedEngineer}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
