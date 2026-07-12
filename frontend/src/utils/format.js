export const currency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

export const number = (n) => new Intl.NumberFormat('en-US').format(n || 0);

export const dateStr = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const cx = (...cls) => cls.filter(Boolean).join(' ');
