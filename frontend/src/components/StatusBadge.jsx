import { cx } from '../utils/format.js';

const MAP = {
  Available:      'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'On Trip':      'bg-brand-50 text-brand-700 ring-brand-200',
  'In Shop':      'bg-amber-50 text-amber-700 ring-amber-200',
  Retired:        'bg-slate-100 text-slate-600 ring-slate-200',
  'On Duty':      'bg-brand-50 text-brand-700 ring-brand-200',
  Leave:          'bg-slate-100 text-slate-600 ring-slate-200',
  Draft:          'bg-slate-100 text-slate-600 ring-slate-200',
  Dispatched:     'bg-brand-50 text-brand-700 ring-brand-200',
  Completed:      'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Cancelled:      'bg-rose-50 text-rose-700 ring-rose-200',
  'In Progress':  'bg-brand-50 text-brand-700 ring-brand-200',
  Scheduled:      'bg-violet-50 text-violet-700 ring-violet-200',
};

export default function StatusBadge({ status }) {
  return (
    <span className={cx(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset',
      MAP[status] || 'bg-slate-100 text-slate-600 ring-slate-200'
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
