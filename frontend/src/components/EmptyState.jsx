import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No results', description = 'Try adjusting your filters or add a new record.', action }) {
  return (
    <div className="text-center py-14 px-4">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 grid place-items-center text-slate-400 mb-3">
        <Inbox className="w-6 h-6" />
      </div>
      <div className="text-sm font-semibold text-slate-800">{title}</div>
      <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
