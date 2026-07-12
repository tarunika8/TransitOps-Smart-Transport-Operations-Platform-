import { TrendingUp, TrendingDown } from 'lucide-react';
import { cx } from '../utils/format.js';

export default function KpiCard({ icon: Icon, label, value, delta, tone = 'brand', hint }) {
  const tones = {
    brand:   'from-brand-500 to-brand-700 text-white',
    emerald: 'from-emerald-500 to-emerald-700 text-white',
    amber:   'from-amber-500 to-amber-600 text-white',
    rose:    'from-rose-500 to-rose-700 text-white',
    slate:   'from-slate-600 to-slate-800 text-white',
    violet:  'from-violet-500 to-violet-700 text-white',
    sky:     'from-sky-500 to-sky-700 text-white',
  };
  const up = (delta || 0) >= 0;
  return (
    <div className="card p-5 hover:shadow-soft transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
          {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
        </div>
        <div className={cx('w-11 h-11 rounded-xl grid place-items-center bg-gradient-to-br shadow-sm', tones[tone])}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      {typeof delta === 'number' && (
        <div className={cx('mt-3 inline-flex items-center gap-1 text-xs font-medium', up ? 'text-emerald-600' : 'text-rose-600')}>
          {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {up ? '+' : ''}{delta}% vs last week
        </div>
      )}
    </div>
  );
}
