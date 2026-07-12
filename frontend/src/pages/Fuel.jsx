import { Fuel as FuelIcon, Wrench, DollarSign } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import DataTable from '../components/DataTable.jsx';
import { fuelLogs, expenseLogs } from '../data/fuel.js';
import { currency, dateStr, number } from '../utils/format.js';

export default function Fuel() {
  const totalFuel = fuelLogs.reduce((s, r) => s + r.cost, 0);
  const totalExpense = expenseLogs.reduce((s, r) => s + r.amount, 0);
  const maintenance = expenseLogs.filter((e) => e.category === 'Repair').reduce((s, r) => s + r.amount, 0);

  const fuelCols = [
    { key: 'id', label: 'Log', render: (r) => <span className="font-medium text-slate-900">{r.id}</span> },
    { key: 'vehicle', label: 'Vehicle', sortable: true },
    { key: 'date', label: 'Date', sortable: true, render: (r) => dateStr(r.date) },
    { key: 'liters', label: 'Liters', sortable: true, render: (r) => number(r.liters) },
    { key: 'cost', label: 'Cost', sortable: true, render: (r) => currency(r.cost), align: 'right' },
    { key: 'odometer', label: 'Odometer', sortable: true, render: (r) => `${number(r.odometer)} km`, align: 'right' },
  ];

  const expCols = [
    { key: 'id', label: 'Ref', render: (r) => <span className="font-medium text-slate-900">{r.id}</span> },
    { key: 'vehicle', label: 'Vehicle', sortable: true },
    { key: 'date', label: 'Date', sortable: true, render: (r) => dateStr(r.date) },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, render: (r) => currency(r.amount), align: 'right' },
  ];

  return (
    <>
      <PageHeader title="Fuel & Expenses" description="Track fuel consumption and all operational expenses across your fleet." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard icon={FuelIcon}   label="Fuel Cost"        value={currency(totalFuel)}                    tone="brand"   delta={-3} />
        <KpiCard icon={Wrench}     label="Maintenance Cost" value={currency(maintenance)}                  tone="amber"   delta={4} />
        <KpiCard icon={DollarSign} label="Operational Cost" value={currency(totalFuel + totalExpense)}     tone="emerald" delta={2} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Fuel Logs</h3>
          <DataTable columns={fuelCols} rows={fuelLogs} pageSize={6} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Expense Logs</h3>
          <DataTable columns={expCols} rows={expenseLogs} pageSize={6} />
        </div>
      </div>
    </>
  );
}
