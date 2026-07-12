import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Truck } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SearchBar from '../components/SearchBar.jsx';
import FilterDropdown from '../components/FilterDropdown.jsx';
import DataTable from '../components/DataTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import vehiclesData from '../data/vehicles.js';
import { currency, number } from '../utils/format.js';
import { useToast } from '../hooks/useToast.jsx';

const STATUSES = ['Available', 'On Trip', 'In Shop', 'Retired'];
const TYPES = ['Truck', 'Trailer', 'Van', 'Pickup'];

const empty = {
  id: '', reg: '', name: '', type: 'Truck',
  capacity: 0, odometer: 0, cost: 0, status: 'Available',
};

export default function Vehicles() {
  const toast = useToast();
  const [rows, setRows] = useState(vehiclesData);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const filtered = useMemo(() => {
    return rows.filter((v) => {
      const matchesQ =
        !q ||
        v.reg.toLowerCase().includes(q.toLowerCase()) ||
        v.name.toLowerCase().includes(q.toLowerCase()) ||
        v.id.toLowerCase().includes(q.toLowerCase());
      const matchesS = !statusFilter || v.status === statusFilter;
      const matchesT = !typeFilter   || v.type   === typeFilter;
      return matchesQ && matchesS && matchesT;
    });
  }, [rows, q, statusFilter, typeFilter]);

  const save = (payload) => {
    if (payload._new) {
      const id = 'V-' + String(rows.length + 1).padStart(3, '0');
      setRows([{ ...payload, id }, ...rows]);
      toast.success('Vehicle added');
    } else {
      setRows(rows.map((r) => (r.id === payload.id ? payload : r)));
      toast.success('Vehicle updated');
    }
    setEditing(null);
  };

  const remove = (id) => {
    setRows(rows.filter((r) => r.id !== id));
    toast.success('Vehicle deleted');
  };

  const columns = [
    { key: 'reg',      label: 'Registration', sortable: true, render: (r) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 grid place-items-center"><Truck className="w-4 h-4" /></div>
        <div>
          <div className="font-medium text-slate-900">{r.reg}</div>
          <div className="text-xs text-slate-500">{r.id}</div>
        </div>
      </div>
    )},
    { key: 'name',     label: 'Vehicle',   sortable: true },
    { key: 'type',     label: 'Type',      sortable: true },
    { key: 'capacity', label: 'Capacity',  sortable: true, render: (r) => `${number(r.capacity)} kg` },
    { key: 'odometer', label: 'Odometer',  sortable: true, render: (r) => `${number(r.odometer)} km` },
    { key: 'cost',     label: 'Acquisition', sortable: true, render: (r) => currency(r.cost) },
    { key: 'status',   label: 'Status',    sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions',  label: '', align: 'right', render: (r) => (
      <div className="flex justify-end gap-1">
        <button className="btn-ghost p-1.5 rounded-md" onClick={() => setEditing(r)} title="Edit"><Pencil className="w-4 h-4" /></button>
        <button className="btn-ghost p-1.5 rounded-md text-rose-600" onClick={() => setConfirm(r)} title="Delete"><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <>
      <PageHeader
        title="Vehicles"
        description="Manage your fleet — registration details, capacity, and current status."
        actions={
          <button className="btn btn-primary" onClick={() => setEditing({ ...empty, _new: true })}>
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        }
      />

      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <SearchBar value={q} onChange={setQ} placeholder="Search by registration, name, ID…" />
        <FilterDropdown label="All statuses" value={statusFilter} onChange={setStatusFilter} options={STATUSES} />
        <FilterDropdown label="All types"    value={typeFilter}   onChange={setTypeFilter}   options={TYPES} />
        <div className="ml-auto text-xs text-slate-500">{filtered.length} of {rows.length} vehicles</div>
      </div>

      <DataTable columns={columns} rows={filtered} pageSize={8}
        emptyTitle="No vehicles found" emptyDescription="Adjust your filters or add a new vehicle." />

      {editing && (
        <VehicleForm value={editing} onClose={() => setEditing(null)} onSave={save} />
      )}

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove(confirm.id)}
        title="Delete vehicle?"
        description={`Are you sure you want to delete ${confirm?.reg}? This action can't be undone.`}
        confirmLabel="Delete"
      />
    </>
  );
}

function VehicleForm({ value, onClose, onSave }) {
  const [f, setF] = useState(value);
  const isNew = !!f._new;
  const set = (k, v) => setF({ ...f, [k]: v });

  const submit = (e) => {
    e.preventDefault();
    onSave({
      ...f,
      capacity: Number(f.capacity),
      odometer: Number(f.odometer),
      cost:     Number(f.cost),
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={isNew ? 'Add Vehicle' : `Edit ${f.reg}`}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>{isNew ? 'Create' : 'Save changes'}</button>
        </>
      }
    >
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Registration Number</label>
          <input className="input" value={f.reg} onChange={(e) => set('reg', e.target.value)} required />
        </div>
        <div>
          <label className="label">Vehicle Name</label>
          <input className="input" value={f.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div>
          <label className="label">Type</label>
          <select className="input" value={f.type} onChange={(e) => set('type', e.target.value)}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={f.status} onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Max Capacity (kg)</label>
          <input type="number" className="input" value={f.capacity} onChange={(e) => set('capacity', e.target.value)} />
        </div>
        <div>
          <label className="label">Odometer (km)</label>
          <input type="number" className="input" value={f.odometer} onChange={(e) => set('odometer', e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Acquisition Cost (USD)</label>
          <input type="number" className="input" value={f.cost} onChange={(e) => set('cost', e.target.value)} />
        </div>
      </form>
    </Modal>
  );
}
