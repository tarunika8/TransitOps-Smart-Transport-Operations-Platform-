import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { KpiCard, PageHeader, StatusPill } from "@/components/ui-bits";
import { useMemo, useState } from "react";
import { Truck, CheckCircle2, Wrench, Route as RouteIcon, Clock, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { differenceInDays, formatDistanceToNow, parseISO } from "date-fns";

export const Route = createFileRoute("/app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { state } = useStore();
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState("");

  const vehicles = useMemo(() => state.vehicles.filter((v) =>
    (type === "all" || v.type === type) &&
    (status === "all" || v.status === status) &&
    (q === "" || v.regNumber.toLowerCase().includes(q.toLowerCase()) || v.name.toLowerCase().includes(q.toLowerCase()))
  ), [state.vehicles, type, status, q]);

  const kpis = useMemo(() => {
    const active = vehicles.filter((v) => v.status === "On Trip").length;
    const available = vehicles.filter((v) => v.status === "Available").length;
    const inShop = vehicles.filter((v) => v.status === "In Shop").length;
    const total = vehicles.length || 1;
    const utilization = Math.round((active / total) * 100);
    const activeTrips = state.trips.filter((t) => t.status === "Dispatched").length;
    const pendingTrips = state.trips.filter((t) => t.status === "Draft").length;
    const driversOnDuty = state.drivers.filter((d) => d.status === "On Trip" || d.status === "Available").length;
    return { active, available, inShop, utilization, activeTrips, pendingTrips, driversOnDuty };
  }, [vehicles, state.trips, state.drivers]);

  const alerts = useMemo(() => {
    const now = new Date();
    return state.drivers
      .map((d) => ({ d, days: differenceInDays(parseISO(d.licenseExpiry), now) }))
      .filter((x) => x.days <= 60)
      .sort((a, b) => a.days - b.days);
  }, [state.drivers]);

  const recentTrips = state.trips.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  const types = Array.from(new Set(state.vehicles.map((v) => v.type)));

  return (
    <div className="space-y-6">
      <PageHeader title="Operations Dashboard" subtitle="Live view of fleet, drivers and trips" />

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search vehicle…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="On Trip">On Trip</SelectItem>
            <SelectItem value="In Shop">In Shop</SelectItem>
            <SelectItem value="Retired">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Active Vehicles" value={kpis.active} tone="info" icon={<Truck className="h-4 w-4 text-info" />} />
        <KpiCard label="Available" value={kpis.available} tone="success" icon={<CheckCircle2 className="h-4 w-4 text-success" />} />
        <KpiCard label="In Maintenance" value={kpis.inShop} tone="warning" icon={<Wrench className="h-4 w-4 text-warning" />} />
        <KpiCard label="Fleet Utilization" value={`${kpis.utilization}%`} tone="primary" icon={<TrendingUp className="h-4 w-4 text-primary" />} />
        <KpiCard label="Active Trips" value={kpis.activeTrips} icon={<RouteIcon className="h-4 w-4" />} />
        <KpiCard label="Pending Trips" value={kpis.pendingTrips} icon={<Clock className="h-4 w-4" />} />
        <KpiCard label="Drivers On Duty" value={kpis.driversOnDuty} icon={<Users className="h-4 w-4" />} />
        <KpiCard label="License Alerts" value={alerts.length} tone={alerts.length ? "warning" : "default"} icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg font-semibold">Recent Trips</h3>
            <span className="text-xs text-muted-foreground font-mono">{recentTrips.length}</span>
          </div>
          <div className="divide-y divide-border">
            {recentTrips.map((t) => {
              const v = state.vehicles.find((x) => x.id === t.vehicleId);
              const d = state.drivers.find((x) => x.id === t.driverId);
              return (
                <div key={t.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{t.source} → {t.destination}</div>
                    <div className="text-xs text-muted-foreground">
                      {v?.regNumber ?? "—"} · {d?.name ?? "—"} · {formatDistanceToNow(parseISO(t.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                  <StatusPill status={t.status} />
                </div>
              );
            })}
            {!recentTrips.length && <div className="py-6 text-center text-sm text-muted-foreground">No trips yet.</div>}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg font-semibold">Compliance Alerts</h3>
            <span className="text-xs text-muted-foreground font-mono">{alerts.length}</span>
          </div>
          <div className="divide-y divide-border">
            {alerts.map(({ d, days }) => (
              <div key={d.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{d.licenseNumber} · {d.licenseCategory}</div>
                </div>
                <div className={`text-xs font-medium ${days < 0 ? "text-destructive" : days < 30 ? "text-warning" : "text-muted-foreground"}`}>
                  {days < 0 ? `Expired ${-days}d ago` : `Expires in ${days}d`}
                </div>
              </div>
            ))}
            {!alerts.length && <div className="py-6 text-center text-sm text-muted-foreground">All licenses valid.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
