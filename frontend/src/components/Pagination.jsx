import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../utils/format.js';

export default function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  const nums = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100">
      <div className="text-xs text-slate-500">
        Showing <b>{from}</b>–<b>{to}</b> of <b>{total}</b>
      </div>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="btn btn-outline px-2 disabled:opacity-50">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {nums.map((n, i) =>
          n === '…' ? (
            <span key={i} className="px-2 text-slate-400">…</span>
          ) : (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={cx(
                'w-8 h-8 rounded-md text-sm font-medium',
                n === page ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {n}
            </button>
          )
        )}
        <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="btn btn-outline px-2 disabled:opacity-50">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
