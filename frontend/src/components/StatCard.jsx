export default function StatCard({ label, value, sub }) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}
