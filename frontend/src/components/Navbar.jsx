import { Menu, Search, Bell, HelpCircle, Moon } from 'lucide-react';
import Breadcrumb from './Breadcrumb.jsx';

export default function Navbar({ onMenu }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-4 px-4 lg:px-6 sticky top-0 z-30">
      <button onClick={onMenu} className="lg:hidden btn-ghost p-2 rounded-md">
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden md:block">
        <Breadcrumb />
      </div>

      <div className="flex-1" />

      <div className="relative hidden sm:block w-64">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input placeholder="Search vehicles, drivers, trips…" className="input pl-9" />
      </div>

      <button className="btn-ghost p-2 rounded-md hidden sm:inline-flex" title="Help"><HelpCircle className="w-5 h-5" /></button>
      <button className="btn-ghost p-2 rounded-md hidden sm:inline-flex" title="Theme"><Moon className="w-5 h-5" /></button>
      <button className="relative btn-ghost p-2 rounded-md">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
      </button>

      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 grid place-items-center text-white text-sm font-semibold">AK</div>
    </header>
  );
}
