import { createFileRoute } from "@tanstack/react-router";
import { useStore, uid } from "@/lib/store";
import { PageHeader, StatusPill } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo, useState } from "react";
import { Download, Plus, Send, CheckCircle2, XCircle } from "lucide-react";
import { exportCSV } from "@/lib/exports";
import { toast } from "sonner";
import type { Trip } from "@/lib/types";
import { differenceInDays, parseISO } from "date-fns";

export const Route = createFileRoute("/app/trips")({
  component: TripsPage,
});

function TripsPage() {
  const { state, update } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => state.trips.filter((t) =>
    (status === "all" || t.status === status) &&
    (q === "" || t.source.toLowerCase().includes(q.toLowerCase()) || t.destination.toLowerCase().includes(q.toLowerCase()))
  ).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [state.trips, q, status]);

  const dispatch = (t: Trip) => {
    const v = state.vehicles.find((x) => x.id === t.vehicleId);
    const d = state.drivers.find((x) => x.id === t.driverId);
    if (!v || !d) return toast.error("Vehicle/driver missing");
    if (v.status !== "Available") return toast.error(`Vehicle is ${v.status}`);
    if (d.status !== "Available") return toast.error(`Driver is ${d.status}`);
    if (differenceInDays(parseISO(d.licenseExpiry), new Date()) < 0) return toast.error("Driver license expired");
    if (t.cargoKg > v.capacityKg) return toast.error(`Cargo ${t.cargoKg}kg exceeds capacity ${v.capacityKg}kg`);
    update((s) => ({
      ...s,
      trips: s.trips.map((x) => x.id === t.id ? { ...x, status: "Dispatched" } : x),
      vehicles: s.vehicles.map((x) => x.id === v.id ? { ...x, status: "On Trip" } : x),
      drivers: s.drivers.map((x) => x.id === d.id ? { ...x, status: "On Trip" } : x),
    }));
    toast.success("Trip dispatched");
  };

  const complete = (t: Trip) => {
    const km = Number(prompt("Actual distance (km)?", String(t.plannedDistance)) ?? 0);
    const fuel = Number(prompt("Fuel consumed (litres)?", "0") ?? 0);
    if (!km) return;
    update((s) => ({
      ...s,
      trips: s.trips.map((x) => x.id === t.id ? { ...x, status: "Completed", actualDistance: km, fuelConsumed: fuel, completedAt: new Date().toISOString() } : x),
      vehicles: s.vehicles.map((x) => x.id === t.vehicleId ? { ...x, status: "Available", odometer: x.odometer + km } : x),
      drivers: s.drivers.map((x) => x.id === t.driverId ? { ...x, status: "Available" } : x),
      fuel: fuel > 0 ? [...s.fuel, { id: uid("f"), vehicleId: t.vehicleId, liters: fuel, cost: fuel * 110, date: new Date().toISOString() }] : s.fuel,
    }));
    toast.success("Trip completed");
  };

  const cancel = (t: Trip) => {
    if (!confirm("Cancel this trip?")) return;
    update((s) => ({
      ...s,
      trips: s.trips.map((x) => x.id === t.id ? { ...x, status: "Cancelled" } : x),
      vehicles: t.status === "Dispatched" ? s.vehicles.map((x) => x.id === t.vehicleId ? { ...x, status: "Available" } : x) : s.vehicles,
      drivers: t.status === "Dispatched" ? s.drivers.map((x) => x.id === t.driverId ? { ...x, status: "Available" } : x) : s.drivers,
    }));
    toast.success("Trip cancelled");
  };

  const csv = rows.map((t) => {
    const v = state.vehicles.find((x) => x.id === t.vehicleId);
    const d = state.drivers.find((x) => x.id === t.driverId);
    return { Source: t.source, Destination: t.destination, Vehicle: v?.regNumber, Driver: d?.name, Cargo_kg: t.cargoKg, Planned_km: t.plannedDistance, Actual_km: t.actualDistance ?? "", Status: t.status };
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Trip Dispatcher"
        subtitle="Create, validate and dispatch trips"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => exportCSV("trips.csv", csv)}><Download className="h-4 w-4 mr-1.5" />CSV</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1.5" />New Trip</Button></DialogTrigger>
              <NewTrip onDone={() => setOpen(false)} />
            </Dialog>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search source or destination…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Dispatched">Dispatched</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead className="text-right">Cargo</TableHead>
              <TableHead className="text-right">Distance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t) => {
              const v = state.vehicles.find((x) => x.id === t.vehicleId);
              const d = state.drivers.find((x) => x.id === t.driverId);
              return (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="font-medium">{t.source} → {t.destination}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{v?.regNumber ?? "—"}</TableCell>
                  <TableCell>{d?.name ?? "—"}</TableCell>
                  <TableCell className="text-right font-mono">{t.cargoKg}kg</TableCell>
                  <TableCell className="text-right font-mono">{t.actualDistance ?? t.plannedDistance}km</TableCell>
                  <TableCell><StatusPill status={t.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {t.status === "Draft" && <Button size="sm" onClick={() => dispatch(t)}><Send className="h-3.5 w-3.5 mr-1" />Dispatch</Button>}
                      {t.status === "Dispatched" && <Button size="sm" variant="outline" onClick={() => complete(t)}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Complete</Button>}
                      {(t.status === "Draft" || t.status === "Dispatched") && <Button size="sm" variant="ghost" onClick={() => cancel(t)}><XCircle className="h-3.5 w-3.5 mr-1 text-destructive" />Cancel</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {!rows.length && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No trips.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function NewTrip({ onDone }: { onDone: () => void }) {
  const { state, update } = useStore();
  const availableV = state.vehicles.filter((v) => v.status === "Available");
  const availableD = state.drivers.filter((d) => d.status === "Available" && differenceInDays(parseISO(d.licenseExpiry), new Date()) >= 0);
  const [f, setF] = useState({ source: "", destination: "", vehicleId: "", driverId: "", cargoKg: 0, plannedDistance: 0 });

  const veh = state.vehicles.find((v) => v.id === f.vehicleId);
  const capacityOverload = veh && f.cargoKg > veh.capacityKg;

  const submit = (asDraft: boolean) => {
    if (!f.source || !f.destination || !f.vehicleId || !f.driverId) return toast.error("Fill all fields");
    if (capacityOverload) return toast.error(`Cargo exceeds vehicle capacity of ${veh!.capacityKg}kg`);
    const trip = { id: uid("t"), ...f, status: (asDraft ? "Draft" : "Dispatched") as Trip["status"], createdAt: new Date().toISOString() };
    update((s) => ({
      ...s,
      trips: [...s.trips, trip],
      vehicles: asDraft ? s.vehicles : s.vehicles.map((x) => x.id === f.vehicleId ? { ...x, status: "On Trip" } : x),
      drivers: asDraft ? s.drivers : s.drivers.map((x) => x.id === f.driverId ? { ...x, status: "On Trip" } : x),
    }));
    toast.success(asDraft ? "Trip saved as draft" : "Trip dispatched");
    onDone();
  };

  return (
    <DialogContent>
      <DialogHeader><DialogTitle>New trip</DialogTitle></DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Source</Label><Input value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Destination</Label><Input value={f.destination} onChange={(e) => setF({ ...f, destination: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Vehicle</Label>
          <Select value={f.vehicleId} onValueChange={(v) => setF({ ...f, vehicleId: v })}>
            <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
            <SelectContent>
              {availableV.map((v) => <SelectItem key={v.id} value={v.id}>{v.regNumber} · {v.capacityKg}kg</SelectItem>)}
              {!availableV.length && <div className="p-2 text-xs text-muted-foreground">No available vehicles</div>}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Driver</Label>
          <Select value={f.driverId} onValueChange={(v) => setF({ ...f, driverId: v })}>
            <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
            <SelectContent>
              {availableD.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} · {d.licenseCategory}</SelectItem>)}
              {!availableD.length && <div className="p-2 text-xs text-muted-foreground">No available drivers</div>}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Cargo (kg)</Label><Input type="number" value={f.cargoKg} onChange={(e) => setF({ ...f, cargoKg: +e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Planned Distance (km)</Label><Input type="number" value={f.plannedDistance} onChange={(e) => setF({ ...f, plannedDistance: +e.target.value })} /></div>
      </div>
      {capacityOverload && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          Vehicle capacity is {veh!.capacityKg}kg. Reduce cargo or pick a bigger vehicle.
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => submit(true)}>Save draft</Button>
        <Button onClick={() => submit(false)} disabled={!!capacityOverload}>Dispatch</Button>
      </DialogFooter>
    </DialogContent>
  );
}
