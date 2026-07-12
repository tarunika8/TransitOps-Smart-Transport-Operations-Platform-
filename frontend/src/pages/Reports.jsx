import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { Gauge, Fuel as FuelIcon, DollarSign, TrendingUp } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { monthlyFuelCost, fuelEfficiency, operationalCost, fleetUtilization } from '../data/charts.js';
import { currency } from '../utils/format.js';

const PIE_COLORS = ['#1a48f5', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

export default function Reports() {
  const totalCost = operationalCost.reduce((s, r) => s + r.value, 0);
  const avgKmpl = (fuelEfficiency.reduce((s, r) => s + r.kmpl, 0) / fuelEfficiency.length).toFixed(2);
  const avgUtil = Math.round(fleetUtilization.reduce((s, r) => s + r.utilization, 0) / fleetUtilization.length);

  return (
    <>
      <PageHeader title="Reports" description="Cross-fleet analytics on utilization, fuel efficiency and operational cost." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={Gauge}       label="Fleet Utilization"  value={`${avgUtil}%`}          tone="brand"   delta={4} />
        <KpiCard icon={FuelIcon}    label="Fuel Efficiency"    value={`${avgKmpl} km/l`}      tone="emerald" delta={3} />
        <KpiCard icon={DollarSign}  label="Operational Cost"   value={currency(totalCost)}    tone="rose"    delta={-2} />
        <KpiCard icon={TrendingUp}  label="Vehicle ROI"        value="18.4%"                  tone="violet"  delta={1} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Fuel vs Maintenance Cost" subtitle="Monthly (USD)">
          <ResponsiveContainer>
            <BarChart data={monthlyFuelCost} margin={{ top: 5, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f7" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip formatter={(v) => currency(v)} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="fuel"        name="Fuel"        fill="#1a48f5" radius={[6, 6, 0, 0]} />
              <Bar dataKey="maintenance" name="Maintenance" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fuel Efficiency Trend" subtitle="km per liter">
          <ResponsiveContainer>
            <LineChart data={fuelEfficiency} margin={{ top: 5, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f7" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={[3.5, 5]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Line type="monotone" dataKey="kmpl" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Operational Cost Split" subtitle="Current month">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={operationalCost} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {operationalCost.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => currency(v)} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fleet Utilization" subtitle="Last 7 days">
          <ResponsiveContainer>
            <BarChart data={fleetUtilization} margin={{ top: 5, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f7" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} unit="%" domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="utilization" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}
