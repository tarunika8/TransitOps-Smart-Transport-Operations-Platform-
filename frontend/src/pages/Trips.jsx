import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SearchBar from '../components/SearchBar.jsx';
import FilterDropdown from '../components/FilterDropdown.jsx';
import DataTable from '../components/DataTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import tripsData from '../data/trips.js';
import vehiclesData from '../data/vehicles.js';
import driversData from '../data/drivers.js';
import { number } from '../utils/format.js';
import { useToast } from '../hooks/useToast.jsx';

const STATUSES = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

const empty = { id: '', source: '', destination: '', vehicle: '', driver: '', cargo: 0, distance: 0, status: 'Draft' };

export default function Trips() {
  const toast = useToast();
  const [rows, setRows] = useState(tripsData);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const filtered = useMemo(() => rows.filter((t) => {
    const mq = !q ||
      t.id.toLowerCase().includes(q.toLowerCase()) ||
      t.source.toLowerCase().includes(q.toLowerCase()) ||
      t.destination.toLowerCase().includes(q.toLowerCase());
    const ms = !statusFilter || t.status === statusFilter;
    return mq && ms;
  }), [rows, q, statusFilter]);

  const validate = (payload) => {
    const v = vehiclesData.find((x) => x.id === payload.vehicle);
    const d = driversData.find((x) => x.id === payload.driver);
    if (!v) return 'Please pick a vehicle.';
    if (!d) return 'Please pick a driver.';

    if (payload.status === 'Dispatched') {
      const vehicleBusy = rows.some((r) => r.vehicle === payload.vehicle && r.status === 'Dispatched' && r.id !== payload.id);
      if (vehicleBusy) return `Vehicle ${v.reg} is already on another dispatched trip.`;

      const driverBusy = rows.some((r) => r.driver === payload.driver && r.status === 'Dispatched' && r.id !== payload.id);
      if (driverBusy) return `Driver ${d.name} is unavailable — already on a trip.`;
    }

    if (Number(payload.cargo) > v.capacity) {
      return `Cargo weight exceeds ${v.reg}'s capacity (${number(v.capacity)} kg).`;
    }
    return null;
  };

  const save = (payload) => {
    const err = validate(payload);
    if (err) { toast.error(err); return; }
    if (payload._new) {
      const id = 'T-' + (2050 + rows.length);
      setRows([{ ...payload, id }, ...rows]);
      toast.success('Trip created');
    } else {
      setRows(rows.map((r) => (r.id === payload.id ? payload : r)));
      toast.success('Trip updated');
    }
    setEditing(null);
  };

  const remove = (id) => {
    setRows(rows.filter((r) => r.id !== id));
    toast.success('Trip deleted');
  };

  const columns = [
    { key: 'id', label: 'Trip', sortable: true, render: (r) => <span className="font-medium text-slate-900">{r.id}</span> },
    { key: 'route', label: 'Route', render: (r) => (
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-brand-500" />
        <span>{r.source} <span className="text-slate-400">→</span> {r.destination}</span>
      </div>
    )},
    { key: 'vehicle', label: 'Vehicle', sortable: true },
    { key: 'driver',  label: 'Driver',  sortable: true },
    { key: 'cargo',   label: 'Cargo',   sortable: true, render: (r) => `${number(r.cargo)} kg` },
    { key: 'distance', label: 'Distance', sortable: true, render: (r) => `${number(r.distance)} km` },
    { key: 'status',  label: 'Status',  sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', align: 'right', render: (r) => (
      <div className="flex justify-end gap-1">
        <button className="btn-ghost p-1.5 rounded-md" onClick={() => setEditing(r)}><Pencil className="w-4 h-4" /></button>
        <button className="btn-ghost p-1.5 rounded-md text-rose-600" onClick={() => setConfirm(r)}><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <>
      <PageHeader
        title="Trips"
        description="Create, dispatch and track cargo trips across your fleet."
        actions={<button className="btn btn-primary" onClick={() => setEditing({ ...empty, _new: true })}><Plus className="w-4 h-4" /> New Trip</button>}
      />

      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <SearchBar value={q} onChange={setQ} placeholder="Search by trip ID or city…" />
        <FilterDropdown label="All statuses" value={statusFilter} onChange={setStatusFilter} options={STATUSES} />
        <div className="ml-auto text-xs text-slate-500">{filtered.length} of {rows.length}</div>
      </div>

      <DataTable columns={columns} rows={filtered} pageSize={8}
        emptyTitle="No trips found" emptyDescription="Adjust your filters or create a new trip." />

      {editing && <TripForm value={editing} onClose={() => setEditing(null)} onSave={save} />}

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove(confirm.id)}
        title="Delete trip?"
        description={`Delete trip ${confirm?.id}? This can't be undone.`}
        confirmLabel="Delete"
      />
    </>
  );
}

function TripForm({ value, onClose, onSave }) {
  const [f, setF] = useState(value);
  const set = (k, v) => setF({ ...f, [k]: v });
  const isNew = !!f._new;

  const submit = (e) => {
    e.preventDefault();
    onSave({ ...f, cargo: Number(f.cargo), distance: Number(f.distance) });
  };

  return (
    <Modal open onClose={onClose} size="lg" title={isNew ? 'Create Trip' : `Edit ${f.id}`}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit}>{isNew ? 'Create Trip' : 'Save changes'}</button>
      </>}
    >
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="label">Source</label><input className="input" value={f.source} onChange={(e) => set('source', e.target.value)} required /></div>
        <div><label className="label">Destination</label><input className="input" value={f.destination} onChange={(e) => set('destination', e.target.value)} required /></div>
        <div>
          <label className="label">Vehicle</label>
          <select className="input" value={f.vehicle} onChange={(e) => set('vehicle', e.target.value)} required>
            <option value="">Select vehicle</option>
            {vehiclesData.filter((v) => v.status !== 'Retired').map((v) => (
              <option key={v.id} value={v.id}>{v.reg} · {v.name} ({number(v.capacity)} kg)</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Driver</label>
          <select className="input" value={f.driver} onChange={(e) => set('driver', e.target.value)} required>
            <option value="">Select driver</option>
            {driversData.map((d) => (
              <option key={d.id} value={d.id}>{d.name} · {d.category}</option>
            ))}
          </select>
        </div>
        <div><label className="label">Cargo Weight (kg)</label><input type="number" className="input" value={f.cargo} onChange={(e) => set('cargo', e.target.value)} /></div>
        <div><label className="label">Distance (km)</label><input type="number" className="input" value={f.distance} onChange={(e) => set('distance', e.target.value)} /></div>
        <div className="sm:col-span-2">
          <label className="label">Status</label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => set('status', s)}
                className={`btn ${f.status === s ? 'btn-primary' : 'btn-outline'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
