import { Loader2 } from 'lucide-react';

export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-slate-500 text-sm">
      <Loader2 className="w-4 h-4 animate-spin" />
      {label}
    </div>
  );
}
