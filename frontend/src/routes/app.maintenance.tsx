import { createFileRoute } from "@tanstack/react-router";
import { useStore, uid } from "@/lib/store";
import { PageHeader } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { MaintenanceLog } from "@/lib/types";

export const Route = createFileRoute("/app/maintenance")({
  component: MaintenancePage,
});

function MaintenancePage() {
  const { state, update } = useStore();
  const [open, setOpen] = useState(false);

  const close = (m: MaintenanceLog) => {
    const veh = state.vehicles.find((v) => v.id === m.vehicleId);
    update((s) => ({
      ...s,
      maintenance: s.maintenance.map((x) => x.id === m.id ? { ...x, closed: true } : x),
      vehicles: s.vehicles.map((v) => v.id === m.vehicleId && v.status !== "Retired" ? { ...v, status: "Available" } : v),
    }));
    toast.success(`Maintenance closed · ${veh?.regNumber ?? ""} back to Available`);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Maintenance"
        subtitle="Open records mark the vehicle In Shop automatically"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> New record</Button></DialogTrigger>
            <NewMaint onDone={() => setOpen(false)} />
          </Dialog>
        }
      />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Service</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.maintenance.slice().reverse().map((m) => {
              const v = state.vehicles.find((x) => x.id === m.vehicleId);
              return (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{v?.regNumber ?? "—"}</TableCell>
                  <TableCell>{m.service}</TableCell>
                  <TableCell className="text-right font-mono">₹{m.cost.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs">{m.date.slice(0, 10)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{m.notes ?? "—"}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium ${m.closed ? "text-success" : "text-warning"}`}>
                      {m.closed ? "Closed" : "Open"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {!m.closed && <Button size="sm" variant="outline" onClick={() => close(m)}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Close</Button>}
                  </TableCell>
                </TableRow>
              );
            })}
            {!state.maintenance.length && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No maintenance logs.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function NewMaint({ onDone }: { onDone: () => void }) {
  const { state, update } = useStore();
  const eligible = state.vehicles.filter((v) => v.status !== "Retired");
  const [f, setF] = useState({ vehicleId: "", service: "", cost: 0, notes: "" });
  const submit = () => {
    if (!f.vehicleId || !f.service) return toast.error("Vehicle and service required");
    const veh = state.vehicles.find((v) => v.id === f.vehicleId);
    if (veh?.status === "On Trip") return toast.error("Vehicle is currently on a trip");
    update((s) => ({
      ...s,
      maintenance: [...s.maintenance, { id: uid("m"), ...f, date: new Date().toISOString(), closed: false }],
      vehicles: s.vehicles.map((v) => v.id === f.vehicleId ? { ...v, status: "In Shop" } : v),
    }));
    toast.success("Vehicle sent to shop");
    onDone();
  };
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>New maintenance record</DialogTitle></DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1.5"><Label>Vehicle</Label>
          <Select value={f.vehicleId} onValueChange={(v) => setF({ ...f, vehicleId: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>{eligible.map((v) => <SelectItem key={v.id} value={v.id}>{v.regNumber} · {v.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Service</Label><Input value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })} placeholder="Oil change, tyre replacement…" /></div>
        <div className="space-y-1.5"><Label>Cost (₹)</Label><Input type="number" value={f.cost} onChange={(e) => setF({ ...f, cost: +e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Notes</Label><Textarea rows={3} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
      </div>
      <DialogFooter><Button onClick={submit}>Save · move to In Shop</Button></DialogFooter>
    </DialogContent>
  );
}
