import { formatDistanceToNow, format, parseISO } from 'date-fns';

export const formatRelativeTime = (date) => {
  if (!date) return '—';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch { return '—'; }
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  try {
    return format(new Date(date), 'MMM d, yyyy HH:mm');
  } catch { return '—'; }
};

export const formatDate = (date) => {
  if (!date) return '—';
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch { return '—'; }
};

export const calcResponseTime = (createdAt, firstResponseAt) => {
  if (!createdAt || !firstResponseAt) return null;
  const mins = Math.round((new Date(firstResponseAt) - new Date(createdAt)) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.round(mins / 60 * 10) / 10}h`;
};

export const calcResolutionTime = (createdAt, resolvedAt) => {
  if (!createdAt || !resolvedAt) return null;
  const hrs = Math.round((new Date(resolvedAt) - new Date(createdAt)) / 3600000 * 10) / 10;
  if (hrs < 24) return `${hrs}h`;
  return `${Math.round(hrs / 24 * 10) / 10}d`;
};

export const truncate = (str, n) => str?.length > n ? str.slice(0, n) + '...' : str;
