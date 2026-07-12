import { useMemo, useState } from 'react';
import { Plus, Pencil, CheckCircle2, XCircle, Wrench } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SearchBar from '../components/SearchBar.jsx';
import FilterDropdown from '../components/FilterDropdown.jsx';
import DataTable from '../components/DataTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import maintenanceData from '../data/maintenance.js';
import vehiclesData from '../data/vehicles.js';
import { dateStr } from '../utils/format.js';
import { useToast } from '../hooks/useToast.jsx';

const STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];
const TYPES = ['Preventive', 'Corrective'];

const empty = { id: '', vehicle: '', issue: '', type: 'Preventive', status: 'Scheduled', start: '', end: null };

export default function Maintenance() {
  const toast = useToast();
  const [rows, setRows] = useState(maintenanceData);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => rows.filter((m) => {
    const mq = !q || m.vehicle.toLowerCase().includes(q.toLowerCase()) || m.issue.toLowerCase().includes(q.toLowerCase());
    const ms = !statusFilter || m.status === statusFilter;
    return mq && ms;
  }), [rows, q, statusFilter]);

  const save = (payload) => {
    if (payload._new) {
      const id = 'M-' + (500 + rows.length + 1);
      setRows([{ ...payload, id }, ...rows]);
      toast.success('Maintenance created');
    } else {
      setRows(rows.map((r) => (r.id === payload.id ? payload : r)));
      toast.success('Maintenance updated');
    }
    setEditing(null);
  };

  const complete = (id) => {
    setRows(rows.map((r) => r.id === id ? { ...r, status: 'Completed', end: new Date().toISOString().slice(0, 10) } : r));
    toast.success('Marked complete');
  };

  const cancel = (id) => {
    setRows(rows.map((r) => r.id === id ? { ...r, status: 'Cancelled' } : r));
    toast.info('Cancelled');
  };

  const columns = [
    { key: 'id',      label: 'ID', sortable: true, render: (r) => <span className="font-medium text-slate-900">{r.id}</span> },
    { key: 'vehicle', label: 'Vehicle', sortable: true, render: (r) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 grid place-items-center"><Wrench className="w-4 h-4" /></div>
        <span>{r.vehicle}</span>
      </div>
    )},
    { key: 'issue',  label: 'Issue' },
    { key: 'type',   label: 'Type',   sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'start',  label: 'Start',  sortable: true, render: (r) => dateStr(r.start) },
    { key: 'end',    label: 'End',    sortable: true, render: (r) => dateStr(r.end) },
    { key: 'actions', label: '', align: 'right', render: (r) => (
      <div className="flex justify-end gap-1">
        <button className="btn-ghost p-1.5 rounded-md" onClick={() => setEditing(r)} title="Edit"><Pencil className="w-4 h-4" /></button>
        {r.status !== 'Completed' && r.status !== 'Cancelled' && (
          <>
            <button className="btn-ghost p-1.5 rounded-md text-emerald-600" onClick={() => complete(r.id)} title="Complete"><CheckCircle2 className="w-4 h-4" /></button>
            <button className="btn-ghost p-1.5 rounded-md text-rose-600" onClick={() => cancel(r.id)} title="Cancel"><XCircle className="w-4 h-4" /></button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <>
      <PageHeader
        title="Maintenance"
        description="Preventive and corrective maintenance across your fleet."
        actions={<button className="btn btn-primary" onClick={() => setEditing({ ...empty, _new: true })}><Plus className="w-4 h-4" /> New Job</button>}
      />

      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <SearchBar value={q} onChange={setQ} placeholder="Search vehicle or issue…" />
        <FilterDropdown label="All statuses" value={statusFilter} onChange={setStatusFilter} options={STATUSES} />
        <div className="ml-auto text-xs text-slate-500">{filtered.length} of {rows.length}</div>
      </div>

      <DataTable columns={columns} rows={filtered} pageSize={8}
        emptyTitle="Nothing scheduled" emptyDescription="Create a new maintenance job to get started." />

      {editing && <MaintenanceForm value={editing} onClose={() => setEditing(null)} onSave={save} />}
    </>
  );
}

function MaintenanceForm({ value, onClose, onSave }) {
  const [f, setF] = useState(value);
  const set = (k, v) => setF({ ...f, [k]: v });
  const isNew = !!f._new;

  const submit = (e) => { e.preventDefault(); onSave(f); };

  return (
    <Modal open onClose={onClose} size="lg" title={isNew ? 'New Maintenance Job' : `Edit ${f.id}`}
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit}>{isNew ? 'Create' : 'Save changes'}</button>
      </>}
    >
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Vehicle</label>
          <select className="input" value={f.vehicle} onChange={(e) => set('vehicle', e.target.value)} required>
            <option value="">Select vehicle</option>
            {vehiclesData.map((v) => <option key={v.id} value={v.id}>{v.id} · {v.reg}</option>)}
          </select>
        </div>
        <div><label className="label">Type</label><select className="input" value={f.type} onChange={(e) => set('type', e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div className="sm:col-span-2"><label className="label">Issue</label><input className="input" value={f.issue} onChange={(e) => set('issue', e.target.value)} required /></div>
        <div><label className="label">Start Date</label><input type="date" className="input" value={f.start || ''} onChange={(e) => set('start', e.target.value)} /></div>
        <div><label className="label">End Date</label><input type="date" className="input" value={f.end || ''} onChange={(e) => set('end', e.target.value || null)} /></div>
        <div className="sm:col-span-2"><label className="label">Status</label><select className="input" value={f.status} onChange={(e) => set('status', e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
      </form>
    </Modal>
  );
}
