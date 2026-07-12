import { createFileRoute } from "@tanstack/react-router";
import { useStore, uid } from "@/lib/store";
import { KpiCard, PageHeader } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import { Download, FileText, Plus, Fuel as FuelIcon, Receipt } from "lucide-react";
import { exportCSV, exportPDF } from "@/lib/exports";
import { toast } from "sonner";

export const Route = createFileRoute("/app/expenses")({
  component: ExpensesPage,
});

function ExpensesPage() {
  const { state, update } = useStore();
  const [openFuel, setOpenFuel] = useState(false);
  const [openExp, setOpenExp] = useState(false);

  const totalFuel = state.fuel.reduce((a, f) => a + f.cost, 0);
  const totalMaint = state.maintenance.reduce((a, m) => a + m.cost, 0);
  const totalExp = state.expenses.reduce((a, e) => a + e.amount, 0);

  const byVehicle = useMemo(() => {
    return state.vehicles.map((v) => {
      const fuel = state.fuel.filter((f) => f.vehicleId === v.id).reduce((a, f) => a + f.cost, 0);
      const maint = state.maintenance.filter((m) => m.vehicleId === v.id).reduce((a, m) => a + m.cost, 0);
      const other = state.expenses.filter((e) => e.vehicleId === v.id).reduce((a, e) => a + e.amount, 0);
      return { v, fuel, maint, other, total: fuel + maint + other };
    });
  }, [state]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fuel & Expense Management"
        subtitle="Track fuel logs, expenses and total operational cost"
        actions={
          <>
            <Dialog open={openFuel} onOpenChange={setOpenFuel}>
              <DialogTrigger asChild><Button variant="outline" size="sm"><FuelIcon className="h-4 w-4 mr-1.5" />Log Fuel</Button></DialogTrigger>
              <NewFuel onDone={() => setOpenFuel(false)} />
            </Dialog>
            <Dialog open={openExp} onOpenChange={setOpenExp}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1.5" />Add Expense</Button></DialogTrigger>
              <NewExp onDone={() => setOpenExp(false)} />
            </Dialog>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Fuel Cost" value={`₹${totalFuel.toLocaleString()}`} tone="warning" icon={<FuelIcon className="h-4 w-4 text-warning" />} />
        <KpiCard label="Maintenance" value={`₹${totalMaint.toLocaleString()}`} tone="info" />
        <KpiCard label="Other Expenses" value={`₹${totalExp.toLocaleString()}`} />
        <KpiCard label="Total Op Cost" value={`₹${(totalFuel + totalMaint + totalExp).toLocaleString()}`} tone="primary" />
      </div>

      <Tabs defaultValue="fuel">
        <TabsList>
          <TabsTrigger value="fuel">Fuel Log</TabsTrigger>
          <TabsTrigger value="exp">Expenses</TabsTrigger>
          <TabsTrigger value="veh">By Vehicle</TabsTrigger>
        </TabsList>

        <TabsContent value="fuel" className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-2 flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => exportCSV("fuel.csv", state.fuel.map((f) => ({ Vehicle: state.vehicles.find((v) => v.id === f.vehicleId)?.regNumber, Litres: f.liters, Cost: f.cost, Date: f.date.slice(0, 10) })))}><Download className="h-4 w-4 mr-1" />CSV</Button>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead className="text-right">Litres</TableHead><TableHead className="text-right">Cost</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {state.fuel.slice().reverse().map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-mono text-xs">{state.vehicles.find((v) => v.id === f.vehicleId)?.regNumber ?? "—"}</TableCell>
                  <TableCell className="text-right font-mono">{f.liters}L</TableCell>
                  <TableCell className="text-right font-mono">₹{f.cost.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs">{f.date.slice(0, 10)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="exp" className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Vehicle</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Date</TableHead><TableHead>Notes</TableHead></TableRow></TableHeader>
            <TableBody>
              {state.expenses.slice().reverse().map((e) => (
                <TableRow key={e.id}>
                  <TableCell><Receipt className="h-3 w-3 inline mr-1 text-muted-foreground" />{e.category}</TableCell>
                  <TableCell className="font-mono text-xs">{state.vehicles.find((v) => v.id === e.vehicleId)?.regNumber ?? "—"}</TableCell>
                  <TableCell className="text-right font-mono">₹{e.amount.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs">{e.date.slice(0, 10)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{e.notes ?? "—"}</TableCell>
                </TableRow>
              ))}
              {!state.expenses.length && <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No expenses.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="veh" className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-2 flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => exportPDF("Operational Cost by Vehicle", byVehicle.map((r) => ({ Vehicle: r.v.regNumber, Fuel: r.fuel, Maintenance: r.maint, Other: r.other, Total: r.total })))}><FileText className="h-4 w-4 mr-1" />PDF</Button>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead className="text-right">Fuel</TableHead><TableHead className="text-right">Maintenance</TableHead><TableHead className="text-right">Other</TableHead><TableHead className="text-right">Total Op Cost</TableHead></TableRow></TableHeader>
            <TableBody>
              {byVehicle.map((r) => (
                <TableRow key={r.v.id}>
                  <TableCell className="font-mono text-xs">{r.v.regNumber}</TableCell>
                  <TableCell className="text-right font-mono">₹{r.fuel.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">₹{r.maint.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">₹{r.other.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">₹{r.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NewFuel({ onDone }: { onDone: () => void }) {
  const { state, update } = useStore();
  const [f, setF] = useState({ vehicleId: "", liters: 0, cost: 0 });
  const submit = () => {
    if (!f.vehicleId || !f.liters) return toast.error("Vehicle and litres required");
    update((s) => ({ ...s, fuel: [...s.fuel, { id: uid("f"), ...f, date: new Date().toISOString() }] }));
    toast.success("Fuel logged"); onDone();
  };
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>Log fuel</DialogTitle></DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5"><Label>Vehicle</Label>
          <Select value={f.vehicleId} onValueChange={(v) => setF({ ...f, vehicleId: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{state.vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.regNumber}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Litres</Label><Input type="number" value={f.liters} onChange={(e) => setF({ ...f, liters: +e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Cost (₹)</Label><Input type="number" value={f.cost} onChange={(e) => setF({ ...f, cost: +e.target.value })} /></div>
      </div>
      <DialogFooter><Button onClick={submit}>Log</Button></DialogFooter>
    </DialogContent>
  );
}

function NewExp({ onDone }: { onDone: () => void }) {
  const { state, update } = useStore();
  const [f, setF] = useState({ vehicleId: "", category: "Toll", amount: 0, notes: "" });
  const submit = () => {
    if (!f.amount) return toast.error("Amount required");
    update((s) => ({ ...s, expenses: [...s.expenses, { id: uid("e"), ...f, date: new Date().toISOString() }] }));
    toast.success("Expense recorded"); onDone();
  };
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>New expense</DialogTitle></DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Vehicle (optional)</Label>
          <Select value={f.vehicleId} onValueChange={(v) => setF({ ...f, vehicleId: v })}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>{state.vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.regNumber}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5"><Label>Category</Label>
          <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Toll">Toll</SelectItem>
              <SelectItem value="Parking">Parking</SelectItem>
              <SelectItem value="Fine">Fine</SelectItem>
              <SelectItem value="Misc">Miscellaneous</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5"><Label>Amount (₹)</Label><Input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: +e.target.value })} /></div>
        <div className="col-span-2 space-y-1.5"><Label>Notes</Label><Input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
      </div>
      <DialogFooter><Button onClick={submit}>Add</Button></DialogFooter>
    </DialogContent>
  );
}
