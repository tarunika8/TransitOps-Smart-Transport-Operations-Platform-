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
import { Download, FileText, Plus, Trash2 } from "lucide-react";
import { exportCSV, exportPDF } from "@/lib/exports";
import { toast } from "sonner";
import type { Driver } from "@/lib/types";
import { differenceInDays, parseISO } from "date-fns";

export const Route = createFileRoute("/app/drivers")({
  component: DriversPage,
});

function DriversPage() {
  const { state, update } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => state.drivers.filter((d) =>
    (status === "all" || d.status === status) &&
    (q === "" || d.name.toLowerCase().includes(q.toLowerCase()) || d.licenseNumber.toLowerCase().includes(q.toLowerCase()))
  ), [state.drivers, q, status]);

  const csvRows = rows.map((d) => ({
    Name: d.name, License: d.licenseNumber, Category: d.licenseCategory, Expiry: d.licenseExpiry,
    Contact: d.contact, Safety: d.safetyScore, Status: d.status,
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Drivers & Safety"
        subtitle="Compliance-driven driver management"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => exportCSV("drivers.csv", csvRows)}><Download className="h-4 w-4 mr-1.5" /> CSV</Button>
            <Button variant="outline" size="sm" onClick={() => exportPDF("Drivers", csvRows)}><FileText className="h-4 w-4 mr-1.5" /> PDF</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1.5" /> Add Driver</Button></DialogTrigger>
              <AddDriver onDone={() => setOpen(false)} />
            </Dialog>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="On Trip">On Trip</SelectItem>
            <SelectItem value="Off Duty">Off Duty</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Safety</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((d) => {
              const days = differenceInDays(parseISO(d.licenseExpiry), new Date());
              const expired = days < 0;
              return (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell className="font-mono">{d.licenseNumber}</TableCell>
                  <TableCell>{d.licenseCategory}</TableCell>
                  <TableCell className={`font-mono ${expired ? "text-destructive" : days < 60 ? "text-warning" : ""}`}>
                    {d.licenseExpiry}{expired && " (expired)"}
                  </TableCell>
                  <TableCell className="font-mono">{d.contact}</TableCell>
                  <TableCell className="text-right font-mono">{d.safetyScore}</TableCell>
                  <TableCell><StatusPill status={d.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Select value={d.status} onValueChange={(val) =>
                        update((s) => ({ ...s, drivers: s.drivers.map((x) => x.id === d.id ? { ...x, status: val as Driver["status"] } : x) }))
                      }>
                        <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Available">Available</SelectItem>
                          <SelectItem value="On Trip">On Trip</SelectItem>
                          <SelectItem value="Off Duty">Off Duty</SelectItem>
                          <SelectItem value="Suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => {
                        if (!confirm(`Delete ${d.name}?`)) return;
                        update((s) => ({ ...s, drivers: s.drivers.filter((x) => x.id !== d.id) }));
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {!rows.length && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No drivers.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AddDriver({ onDone }: { onDone: () => void }) {
  const { update } = useStore();
  const [f, setF] = useState({ name: "", licenseNumber: "", licenseCategory: "LMV", licenseExpiry: "", contact: "", safetyScore: 90 });
  const submit = () => {
    if (!f.name || !f.licenseNumber || !f.licenseExpiry) return toast.error("Fill required fields");
    update((s) => ({ ...s, drivers: [...s.drivers, { id: uid("d"), ...f, status: "Available" }] }));
    toast.success("Driver added"); onDone();
  };
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Add driver</DialogTitle></DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5"><Label>Name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>License Number</Label><Input value={f.licenseNumber} onChange={(e) => setF({ ...f, licenseNumber: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Category</Label>
          <Select value={f.licenseCategory} onValueChange={(v) => setF({ ...f, licenseCategory: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LMV">LMV</SelectItem>
              <SelectItem value="HMV">HMV</SelectItem>
              <SelectItem value="MCWG">MCWG</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>License Expiry</Label><Input type="date" value={f.licenseExpiry} onChange={(e) => setF({ ...f, licenseExpiry: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Contact</Label><Input value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} /></div>
        <div className="col-span-2 space-y-1.5"><Label>Safety Score</Label><Input type="number" min={0} max={100} value={f.safetyScore} onChange={(e) => setF({ ...f, safetyScore: +e.target.value })} /></div>
      </div>
      <DialogFooter><Button onClick={submit}>Add</Button></DialogFooter>
    </DialogContent>
  );
}
