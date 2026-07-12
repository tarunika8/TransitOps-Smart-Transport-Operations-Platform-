import {
  Truck, CheckCircle2, Wrench, Route as RouteIcon, Clock,
  Users, Gauge, ArrowRight, AlertTriangle, Fuel as FuelIcon,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import vehicles from '../data/vehicles.js';
import trips from '../data/trips.js';
import maintenance from '../data/maintenance.js';
import { fleetUtilization, operationalCost, monthlyFuelCost } from '../data/charts.js';
import { currency, number } from '../utils/format.js';

const PIE_COLORS = ['#1a48f5', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

export default function Dashboard() {
  const active     = vehicles.filter((v) => v.status === 'On Trip').length;
  const available  = vehicles.filter((v) => v.status === 'Available').length;
  const inShop     = vehicles.filter((v) => v.status === 'In Shop').length;
  const total      = vehicles.length;
  const utilization = Math.round((active / (total - vehicles.filter((v) => v.status === 'Retired').length)) * 100);

  const activeTrips  = trips.filter((t) => t.status === 'Dispatched').length;
  const pendingTrips = trips.filter((t) => t.status === 'Draft').length;
  const onDuty       = 5; // from drivers mock

  const totalFuel        = monthlyFuelCost[monthlyFuelCost.length - 1].fuel;
  const totalMaintenance = monthlyFuelCost[monthlyFuelCost.length - 1].maintenance;

  return (
    <>
      <PageHeader
        title="Operations Dashboard"
        description="Real-time fleet performance and today's operations at a glance."
        actions={
          <Link to="/trips" className="btn btn-primary">
            <RouteIcon className="w-4 h-4" /> New Trip
          </Link>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Truck}        label="Active Vehicles"    value={active}     delta={4}  tone="brand" />
        <KpiCard icon={CheckCircle2} label="Available Vehicles" value={available}  delta={2}  tone="emerald" />
        <KpiCard icon={Wrench}       label="Vehicles in Shop"   value={inShop}     delta={-1} tone="amber" />
        <KpiCard icon={RouteIcon}    label="Active Trips"       value={activeTrips} delta={7} tone="sky" />
        <KpiCard icon={Clock}        label="Pending Trips"      value={pendingTrips} delta={0} tone="slate" />
        <KpiCard icon={Users}        label="Drivers On Duty"    value={onDuty}     delta={3}  tone="violet" />
        <KpiCard icon={Gauge}        label="Fleet Utilization"  value={`${utilization}%`} delta={5} tone="brand" hint="Active / Operational" />
        <KpiCard icon={FuelIcon}     label="Fuel Cost (Jul)"    value={currency(totalFuel)} delta={-3} tone="rose" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <ChartCard title="Fleet Utilization" subtitle="Last 7 days" className="lg:col-span-2">
          <ResponsiveContainer>
            <AreaChart data={fleetUtilization} margin={{ top: 5, right: 12, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="util" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#1a48f5" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#1a48f5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f7" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} unit="%" domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="utilization" stroke="#1a48f5" strokeWidth={2.5} fill="url(#util)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Operational Cost Split" subtitle="Current month">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={operationalCost} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {operationalCost.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => currency(v)} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        {/* Recent Trips */}
        <div className="card lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Recent Trips</h3>
              <p className="text-xs text-slate-500">Latest dispatched and completed trips</p>
            </div>
            <Link to="/trips" className="text-sm font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="th">Trip</th>
                  <th className="th">Route</th>
                  <th className="th">Vehicle</th>
                  <th className="th">Cargo</th>
                  <th className="th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trips.slice(0, 6).map((t) => (
                  <tr key={t.id} className="row-hover">
                    <td className="td font-medium text-slate-900">{t.id}</td>
                    <td className="td">{t.source} → {t.destination}</td>
                    <td className="td">{t.vehicle}</td>
                    <td className="td">{number(t.cargo)} kg</td>
                    <td className="td"><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance Alerts */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Maintenance Alerts</h3>
            <p className="text-xs text-slate-500">Vehicles needing attention</p>
          </div>
          <ul className="divide-y divide-slate-100">
            {maintenance.filter((m) => m.status !== 'Completed' && m.status !== 'Cancelled').map((m) => (
              <li key={m.id} className="p-4 flex items-start gap-3 hover:bg-slate-50">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 grid place-items-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-slate-800 truncate">{m.vehicle} · {m.issue}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{m.type} · Started {m.start}</div>
                </div>
                <StatusBadge status={m.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Vehicle status + fuel summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6 mb-2">
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Vehicle Status Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Available', value: available, color: 'bg-emerald-500' },
              { label: 'On Trip',   value: active,    color: 'bg-brand-500' },
              { label: 'In Shop',   value: inShop,    color: 'bg-amber-500' },
              { label: 'Retired',   value: vehicles.filter((v) => v.status === 'Retired').length, color: 'bg-slate-400' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className={`w-2 h-2 rounded-full ${s.color}`} /> {s.label}
                </div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800">Fuel Cost Summary</h3>
          <p className="text-xs text-slate-500">Current month</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Fuel</span>
              <span className="text-sm font-semibold text-slate-900">{currency(totalFuel)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Maintenance</span>
              <span className="text-sm font-semibold text-slate-900">{currency(totalMaintenance)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Operational</span>
              <span className="text-sm font-semibold text-slate-900">{currency(totalFuel + totalMaintenance + 96000)}</span>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <Link to="/reports" className="btn btn-outline w-full justify-center">
                View full report <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
