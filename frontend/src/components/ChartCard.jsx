export default function ChartCard({ title, subtitle, action, children, className }) {
  return (
    <div className={`card p-5 ${className || ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="h-64">{children}</div>
    </div>
  );
}
