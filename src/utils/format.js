export const formatCurrency = (amount, currency = 'PHP') => {
  if (amount === null || amount === undefined) return '—';
  const localeMap = { JPY: 'ja-JP', PHP: 'en-PH', USD: 'en-US', EUR: 'de-DE', SGD: 'en-SG' };
  const locale = localeMap[currency] || navigator.language || 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
};

export const statusLabel = (status) => status?.replace(/_/g, ' ');

export const badgeClass = (status) => {
  const map = {
    draft:       'badge-draft',
    in_progress: 'badge-progress',
    completed:   'badge-completed',
    paid:        'badge-paid',
    partial:     'badge-partial',
    overdue:     'badge-overdue',
    sent:        'badge-sent',
    cancelled:   'badge-cancelled',
    urgent:      'badge-urgent',
    high:        'badge-high',
    normal:      'badge-normal',
    low:         'badge-low',
  };
  return `badge ${map[status] || 'badge-draft'}`;
};