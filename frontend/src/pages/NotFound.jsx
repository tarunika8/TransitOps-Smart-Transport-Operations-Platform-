import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center text-center">
      <div>
        <div className="text-6xl font-bold text-slate-900">404</div>
        <p className="mt-2 text-slate-500">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="btn btn-primary mt-4 inline-flex">Back to Dashboard</Link>
      </div>
    </div>
  );
}
