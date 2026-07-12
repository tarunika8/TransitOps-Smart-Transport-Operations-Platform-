import { useState } from 'react';
import { Save } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import { useToast } from '../hooks/useToast.jsx';

export default function Settings() {
  const toast = useToast();
  const [company, setCompany] = useState({
    name: 'TransitOps Logistics Pvt. Ltd.',
    email: 'ops@transitops.io',
    phone: '+91 22 4000 1234',
    currency: 'USD',
    timezone: 'Asia/Kolkata',
  });
  const [prefs, setPrefs] = useState({
    notifTrips: true,
    notifMaint: true,
    notifFuel: false,
    autoDispatch: false,
  });

  const save = (e) => {
    e.preventDefault();
    toast.success('Settings saved');
  };

  return (
    <>
      <PageHeader title="Settings" description="Company profile, defaults and notification preferences." />

      <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Company Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="label">Company Name</label><input className="input" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} /></div>
            <div><label className="label">Contact Email</label><input type="email" className="input" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} /></div>
            <div><label className="label">Phone</label><input className="input" value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} /></div>
            <div><label className="label">Currency</label>
              <select className="input" value={company.currency} onChange={(e) => setCompany({ ...company, currency: e.target.value })}>
                <option>USD</option><option>INR</option><option>EUR</option><option>GBP</option>
              </select>
            </div>
            <div><label className="label">Timezone</label>
              <select className="input" value={company.timezone} onChange={(e) => setCompany({ ...company, timezone: e.target.value })}>
                <option>Asia/Kolkata</option><option>Asia/Dubai</option><option>Europe/London</option><option>America/New_York</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Preferences</h3>
          <div className="space-y-3">
            {[
              ['notifTrips', 'Trip status notifications'],
              ['notifMaint', 'Maintenance alerts'],
              ['notifFuel',  'Fuel cost alerts'],
              ['autoDispatch', 'Auto-dispatch draft trips'],
            ].map(([k, label]) => (
              <label key={k} className="flex items-center justify-between gap-3 py-1">
                <span className="text-sm text-slate-700">{label}</span>
                <button
                  type="button"
                  onClick={() => setPrefs({ ...prefs, [k]: !prefs[k] })}
                  className={`w-10 h-6 rounded-full transition-colors relative ${prefs[k] ? 'bg-brand-600' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${prefs[k] ? 'left-4' : 'left-0.5'}`} />
                </button>
              </label>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 flex justify-end">
          <button className="btn btn-primary"><Save className="w-4 h-4" /> Save changes</button>
        </div>
      </form>
    </>
  );
}
