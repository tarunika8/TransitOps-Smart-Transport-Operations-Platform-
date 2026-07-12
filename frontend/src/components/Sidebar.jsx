import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Users, Route as RouteIcon, Wrench, Fuel,
  BarChart3, Settings, ChevronLeft, Bus,
} from 'lucide-react';
import { cx } from '../utils/format.js';

const NAV = [
  { to: '/dashboard',   label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/vehicles',    label: 'Vehicles',        icon: Truck },
  { to: '/drivers',     label: 'Drivers',         icon: Users },
  { to: '/trips',       label: 'Trips',           icon: RouteIcon },
  { to: '/maintenance', label: 'Maintenance',     icon: Wrench },
  { to: '/fuel',        label: 'Fuel & Expenses', icon: Fuel },
  { to: '/reports',     label: 'Reports',         icon: BarChart3 },
  { to: '/settings',    label: 'Settings',        icon: Settings },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden" onClick={onMobileClose} />
      )}

      <aside
        className={cx(
          'fixed lg:static z-50 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300',
          collapsed ? 'w-[76px]' : 'w-[248px]',
          mobileOpen ? 'left-0' : '-left-full lg:left-0'
        )}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center shadow-sm shrink-0">
              <Bus className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="font-bold text-slate-900 leading-tight">TransitOps</div>
                <div className="text-[11px] text-slate-500">Fleet Operations</div>
              </div>
            )}
          </div>
          <button onClick={onToggle} className="hidden lg:grid place-items-center w-7 h-7 rounded-md hover:bg-slate-100 text-slate-500">
            <ChevronLeft className={cx('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className={cx('text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2', collapsed && 'sr-only')}>
            Main
          </div>
          <ul className="space-y-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    cx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )
                  }
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100">
          <div className={cx('flex items-center gap-3', collapsed && 'justify-center')}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 grid place-items-center text-white text-sm font-semibold">AK</div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">Ananya Kapoor</div>
                <div className="text-xs text-slate-500 truncate">Fleet Manager</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
