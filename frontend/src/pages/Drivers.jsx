import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SearchBar from '../components/SearchBar.jsx';
import FilterDropdown from '../components/FilterDropdown.jsx';
import DataTable from '../components/DataTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import driversData from '../data/drivers.js';
import { dateStr, cx } from '../utils/format.js';
import { useToast } from '../hooks/useToast.jsx';

const CATEGORIES = ['Heavy', 'Trailer', 'Light'];
const STATUSES = ['Available', 'On Duty', 'Leave'];

const empty = { id: '', name: '', license: '', category: 'Heavy', expiry: '', phone: '', score: 80, status: 'Available' };

export default function Drivers() {
  const toast = useToast();
  const [rows, setRows] = useState(driversData);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const filtered = useMemo(() => rows.filter((d) => {
    const mq = !q || d.name.toLowerCase().includes(q.toLowerCase()) || d.license.toLowerCase().includes(q.toLowerCase());
    const ms = !statusFilter || d.status === statusFilter;
    const mc = !catFilter    || d.category === catFilter;
    return mq && ms && mc;
  }), [rows, q, statusFilter, catFilter]);

  const save = (payload) => {
    if (payload._new) {
      const id = 'D-' + (100 + rows.length + 1);
      setRows([{ ...payload, id }, ...rows]);
      toast.success('Driver added');
    } else {
      setRows(rows.map((r) => (r.id === payload.id ? payload : r)));
      toast.success('Driver updated');
    }
    setEditing(null);
  };

  const remove = (id) => {
    setRows(rows.filter((r) => r.id !== id));
    toast.success('Driver removed');
  };

  const columns = [
    { key: 'name', label: 'Driver', sortable: true, render: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 grid place-items-center text-white text-sm font-semibold">
          {r.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
        </div>
        <div>
          <div className="font-medium text-slate-900">{r.name}</div>
          <div className="text-xs text-slate-500">{r.id}</div>
        </div>
      </div>
    )},
    { key: 'license',  label: 'License',   sortable: true },
    { key: 'category', label: 'Category',  sortable: true },
    { key: 'expiry',   label: 'Expiry',    sortable: true, render: (r) => dateStr(r.expiry) },
    { key: 'phone',    label: 'Contact' },
    { key: 'score',    label: 'Safety',    sortable: true, render: (r) => <SafetyScore v={r.score} /> },
    { key: 'status',   label: 'Status',    sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions',  label: '', align: 'right', render: (r) => (
      <div className="flex justify-end gap-1">
        <button className="btn-ghost p-1.5 rounded-md" onClick={() => setEditing(r)}><Pencil className="w-4 h-4" /></button>
        <button className="btn-ghost p-1.5 rounded-md text-rose-600" onClick={() => setConfirm(r)}><Trash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <>
      <PageHeader
        title="Drivers"
        description="Manage licenses, contact details and safety scores for your drivers."
        actions={<button className="btn btn-primary" onClick={() => setEditing({ ...empty, _new: true })}><Plus className="w-4 h-4" /> Add Driver</button>}
      />

      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <SearchBar value={q} onChange={setQ} placeholder="Search by name or license…" />
        <FilterDropdown label="All statuses"   value={statusFilter} onChange={setStatusFilter} options={STATUSES} />
        <FilterDropdown label="All categories" value={catFilter}    onChange={setCatFilter}    options={CATEGORIES} />
        <div className="ml-auto text-xs text-slate-500">{filtered.length} of {rows.length}</div>
      </div>

      <DataTable columns={columns} rows={filtered} pageSize={8}
        emptyTitle="No drivers found" emptyDescription="Adjust your filters or add a new driver." />

      {editing && <DriverForm value={editing} onClose={() => setEditing(null)} onSave={save} />}

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove(confirm.id)}
        title="Remove driver?"
        description={`Remove ${confirm?.name} from the roster?`}
        confirmLabel="Remove"
      />
    </>
  );
}

function SafetyScore({ v }) {
  const tone =
    v >= 90 ? 'text-emerald-600 bg-emerald-50 ring-emerald-200'
    : v >= 80 ? 'text-brand-600 bg-brand-50 ring-brand-200'
    : 'text-amber-600 bg-amber-50 ring-amber-200';
  return (
    <span className={cx('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ring-1 ring-inset', tone)}>
      <ShieldCheck className="w-3 h-3" /> {v}
    </span>
  );
}

function DriverForm({ value, onClose, onSave }) {
  const [f, setF] = useState(value);
  const set = (k, v) => setF({ ...f, [k]: v });
  const isNew = !!f._new;

  const submit = (e) => {
    e.preventDefault();
    onSave({ ...f, score: Number(f.score) });
  };

  return (
    <Modal open onClose={onClose} title={isNew ? 'Add Driver' : `Edit ${f.name}`} size="lg"
      footer={<>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit}>{isNew ? 'Create' : 'Save changes'}</button>
      </>}
    >
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className="label">Full Name</label><input className="input" value={f.name} onChange={(e) => set('name', e.target.value)} required /></div>
        <div><label className="label">License Number</label><input className="input" value={f.license} onChange={(e) => set('license', e.target.value)} required /></div>
        <div><label className="label">Category</label><select className="input" value={f.category} onChange={(e) => set('category', e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label className="label">License Expiry</label><input type="date" className="input" value={f.expiry} onChange={(e) => set('expiry', e.target.value)} /></div>
        <div><label className="label">Contact Number</label><input className="input" value={f.phone} onChange={(e) => set('phone', e.target.value)} /></div>
        <div><label className="label">Safety Score</label><input type="number" min="0" max="100" className="input" value={f.score} onChange={(e) => set('score', e.target.value)} /></div>
        <div><label className="label">Status</label><select className="input" value={f.status} onChange={(e) => set('status', e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
      </form>
    </Modal>
  );
}
