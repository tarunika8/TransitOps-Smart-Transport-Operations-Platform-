import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center text-sm text-slate-500">
      <Link to="/dashboard" className="flex items-center gap-1 hover:text-slate-800">
        <Home className="w-4 h-4" />
      </Link>
      {parts.map((p, i) => {
        const to = '/' + parts.slice(0, i + 1).join('/');
        const isLast = i === parts.length - 1;
        return (
          <span key={to} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-1 text-slate-300" />
            {isLast ? (
              <span className="font-medium text-slate-800 capitalize">{p}</span>
            ) : (
              <Link to={to} className="capitalize hover:text-slate-800">{p}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
