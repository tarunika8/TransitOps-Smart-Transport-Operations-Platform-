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
import { Download, FileText, Plus, Trash2, FileUp } from "lucide-react";
import { exportCSV, exportPDF } from "@/lib/exports";
import { toast } from "sonner";
import type { Vehicle } from "@/lib/types";

export const Route = createFileRoute("/app/fleet")({
  component: FleetPage,
});

function FleetPage() {
  const { state, update } = useStore();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const [docsFor, setDocsFor] = useState<Vehicle | null>(null);

  const rows = useMemo(() => state.vehicles.filter((v) =>
    (type === "all" || v.type === type) &&
    (status === "all" || v.status === status) &&
    (q === "" || v.regNumber.toLowerCase().includes(q.toLowerCase()) || v.name.toLowerCase().includes(q.toLowerCase()))
  ), [state.vehicles, q, type, status]);

  const types = Array.from(new Set(state.vehicles.map((v) => v.type)));

  const csvRows = rows.map((v) => ({
    Registration: v.regNumber, Name: v.name, Type: v.type, Capacity_kg: v.capacityKg,
    Odometer: v.odometer, Acquisition_Cost: v.acquisitionCost, Status: v.status,
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Vehicle Registry"
        subtitle="Master list of every asset in your fleet"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => exportCSV("vehicles.csv", csvRows)}>
              <Download className="h-4 w-4 mr-1.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportPDF("Vehicle Registry", csvRows)}>
              <FileText className="h-4 w-4 mr-1.5" /> PDF
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Add Vehicle</Button>
              </DialogTrigger>
              <AddVehicleDialog onDone={() => setOpen(false)} />
            </Dialog>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search registration or model…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="On Trip">On Trip</SelectItem>
            <SelectItem value="In Shop">In Shop</SelectItem>
            <SelectItem value="Retired">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registration</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Capacity</TableHead>
              <TableHead className="text-right">Odometer</TableHead>
              <TableHead className="text-right">Acquisition</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-mono">{v.regNumber}</TableCell>
                <TableCell>{v.name}</TableCell>
                <TableCell>{v.type}</TableCell>
                <TableCell className="text-right font-mono">{v.capacityKg} kg</TableCell>
                <TableCell className="text-right font-mono">{v.odometer.toLocaleString()} km</TableCell>
                <TableCell className="text-right font-mono">₹{v.acquisitionCost.toLocaleString()}</TableCell>
                <TableCell><StatusPill status={v.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setDocsFor(v)}>
                      <FileUp className="h-3.5 w-3.5 mr-1" />Docs
                    </Button>
                    <Select
                      value={v.status}
                      onValueChange={(val) =>
                        update((s) => ({ ...s, vehicles: s.vehicles.map((x) => x.id === v.id ? { ...x, status: val as Vehicle["status"] } : x) }))
                      }
                    >
                      <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="On Trip">On Trip</SelectItem>
                        <SelectItem value="In Shop">In Shop</SelectItem>
                        <SelectItem value="Retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => {
                      if (!confirm(`Delete ${v.regNumber}?`)) return;
                      update((s) => ({ ...s, vehicles: s.vehicles.filter((x) => x.id !== v.id) }));
                      toast.success("Vehicle deleted");
                    }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No vehicles match your filters.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!docsFor} onOpenChange={(o) => !o && setDocsFor(null)}>
        {docsFor && <DocsDialog vehicle={docsFor} onClose={() => setDocsFor(null)} />}
      </Dialog>
    </div>
  );
}

function AddVehicleDialog({ onDone }: { onDone: () => void }) {
  const { state, update } = useStore();
  const [form, setForm] = useState({ regNumber: "", name: "", type: "Van", capacityKg: 500, odometer: 0, acquisitionCost: 0 });
  const submit = () => {
    if (!form.regNumber || !form.name) return toast.error("Registration and name are required.");
    if (state.vehicles.some((v) => v.regNumber.toLowerCase() === form.regNumber.toLowerCase())) {
      return toast.error("Registration number must be unique.");
    }
    update((s) => ({ ...s, vehicles: [...s.vehicles, { id: uid("v"), ...form, status: "Available" }] }));
    toast.success("Vehicle added");
    onDone();
  };
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Register vehicle</DialogTitle></DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5"><Label>Registration Number</Label><Input value={form.regNumber} onChange={(e) => setForm({ ...form, regNumber: e.target.value })} placeholder="KA01AB1234" /></div>
        <div className="col-span-2 space-y-1.5"><Label>Model / Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Van">Van</SelectItem>
              <SelectItem value="Truck">Truck</SelectItem>
              <SelectItem value="Pickup">Pickup</SelectItem>
              <SelectItem value="Bike">Bike</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Capacity (kg)</Label><Input type="number" value={form.capacityKg} onChange={(e) => setForm({ ...form, capacityKg: +e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Odometer (km)</Label><Input type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: +e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Acquisition Cost (₹)</Label><Input type="number" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: +e.target.value })} /></div>
      </div>
      <DialogFooter><Button onClick={submit}>Register</Button></DialogFooter>
    </DialogContent>
  );
}

function DocsDialog({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const { update } = useStore();
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const docs = vehicle.documents ?? [];
  const add = () => {
    if (!name) return;
    update((s) => ({
      ...s,
      vehicles: s.vehicles.map((v) => v.id === vehicle.id ? { ...v, documents: [...(v.documents ?? []), { name, expiry: expiry || undefined }] } : v),
    }));
    setName(""); setExpiry("");
    toast.success("Document added");
  };
  const remove = (idx: number) => {
    update((s) => ({ ...s, vehicles: s.vehicles.map((v) => v.id === vehicle.id ? { ...v, documents: (v.documents ?? []).filter((_, i) => i !== idx) } : v) }));
  };
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>{vehicle.regNumber} · Documents</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div className="rounded-lg border border-border divide-y divide-border">
          {docs.length === 0 && <div className="p-4 text-sm text-muted-foreground text-center">No documents attached.</div>}
          {docs.map((d, i) => (
            <div key={i} className="p-3 flex items-center justify-between text-sm">
              <div>
                <div className="font-medium">{d.name}</div>
                {d.expiry && <div className="text-xs text-muted-foreground font-mono">Expires {d.expiry}</div>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Input placeholder="Document name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-2" />
          <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
        </div>
        <Button onClick={add} className="w-full"><Plus className="h-4 w-4 mr-1.5" /> Add document</Button>
      </div>
      <DialogFooter><Button variant="outline" onClick={onClose}>Close</Button></DialogFooter>
    </DialogContent>
  );
}
