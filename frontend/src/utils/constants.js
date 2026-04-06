export const SEVERITY_CONFIG = {
  'P0 - Critical': { color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-700/50', dot: 'bg-red-400', badge: 'bg-red-900/40 text-red-300 border border-red-800/60' },
  'P1 - High': { color: 'text-orange-400', bg: 'bg-orange-900/20', border: 'border-orange-700/50', dot: 'bg-orange-400', badge: 'bg-orange-900/30 text-orange-300 border border-orange-800/60' },
  'P2 - Medium': { color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700/50', dot: 'bg-yellow-400', badge: 'bg-yellow-900/20 text-yellow-300 border border-yellow-800/60' },
  'P3 - Low': { color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-700/50', dot: 'bg-green-500', badge: 'bg-green-900/20 text-green-300 border border-green-800/60' },
};

export const STATUS_CONFIG = {
  'Open': { color: 'text-sky-400', badge: 'bg-sky-900/30 text-sky-300 border border-sky-800/60', dot: 'bg-sky-400' },
  'In Progress': { color: 'text-blue-400', badge: 'bg-blue-900/30 text-blue-300 border border-blue-800/60', dot: 'bg-blue-400' },
  'Pending Review': { color: 'text-purple-400', badge: 'bg-purple-900/30 text-purple-300 border border-purple-800/60', dot: 'bg-purple-400' },
  'Escalated': { color: 'text-red-400', badge: 'bg-red-900/40 text-red-300 border border-red-700/60', dot: 'bg-red-400 animate-pulse' },
  'Resolved': { color: 'text-emerald-400', badge: 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/60', dot: 'bg-emerald-400' },
  'Closed': { color: 'text-gray-500', badge: 'bg-gray-800/60 text-gray-500 border border-gray-700/60', dot: 'bg-gray-500' },
};

export const CATEGORIES = [
  'API Failure', 'Authentication / Login', 'Payment Processing', 'Data Sync Delay',
  'Dashboard / UI Bug', 'Data Mismatch', 'Performance Degradation', 'Notification Failure',
  'Onboarding Issue', 'Integration Error', 'Rate Limiting', 'Configuration Error',
  'Database Timeout', 'Security Alert', 'Billing Discrepancy'
];

export const TEAMS = ['Platform', 'Payments', 'Auth', 'Data Pipeline', 'Frontend', 'Security', 'DevOps', 'Unassigned'];
export const SEVERITIES = ['P0 - Critical', 'P1 - High', 'P2 - Medium', 'P3 - Low'];
export const STATUSES = ['Open', 'In Progress', 'Pending Review', 'Escalated', 'Resolved', 'Closed'];
export const SOURCES = ['Email', 'Slack', 'API Monitor', 'Customer Portal', 'Internal Alert', 'PagerDuty', 'Zendesk'];

export const CATEGORY_ICONS = {
  'API Failure': '⚡',
  'Authentication / Login': '🔐',
  'Payment Processing': '💳',
  'Data Sync Delay': '🔄',
  'Dashboard / UI Bug': '🖥️',
  'Data Mismatch': '⚠️',
  'Performance Degradation': '📉',
  'Notification Failure': '🔔',
  'Onboarding Issue': '🚀',
  'Integration Error': '🔌',
  'Rate Limiting': '🚦',
  'Configuration Error': '⚙️',
  'Database Timeout': '🗄️',
  'Security Alert': '🛡️',
  'Billing Discrepancy': '💰',
};
