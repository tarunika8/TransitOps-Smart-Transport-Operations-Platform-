export default function UserProfile({ name = 'Ananya Kapoor', role = 'Fleet Manager', initials = 'AK' }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 grid place-items-center text-white text-sm font-semibold">
        {initials}
      </div>
      <div className="hidden md:block">
        <div className="text-sm font-medium text-slate-800 leading-tight">{name}</div>
        <div className="text-xs text-slate-500">{role}</div>
      </div>
    </div>
  );
}
