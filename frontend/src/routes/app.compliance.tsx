import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { KpiCard, PageHeader, StatusPill } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, Download, FileText, ShieldAlert } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { exportCSV, exportPDF } from "@/lib/exports";
import { toast } from "sonner";

export const Route = createFileRoute("/app/compliance")({
  component: CompliancePage,
});

function CompliancePage() {
  const { state, update } = useStore();
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const now = new Date();
    return state.drivers
      .map((d) => ({ d, days: differenceInDays(parseISO(d.licenseExpiry), now) }))
      .filter(({ d }) => q === "" || d.name.toLowerCase().includes(q.toLowerCase()) || d.licenseNumber.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.days - b.days);
  }, [state.drivers, q]);

  const expired = rows.filter((r) => r.days < 0);
  const soon = rows.filter((r) => r.days >= 0 && r.days <= 60);
  const suspended = state.drivers.filter((d) => d.status === "Suspended");
  const okCount = rows.length - expired.length - soon.length;

  const csvRows = rows.map(({ d, days }) => ({
    Name: d.name, License: d.licenseNumber, Category: d.licenseCategory,
    Expiry: d.licenseExpiry, Days_To_Expiry: days, Safety_Score: d.safetyScore, Status: d.status,
  }));

  const sendReminder = (name: string) => toast.success(`Reminder email queued for ${name}`);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Compliance"
        subtitle="License expiry, safety scores and suspended drivers"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => exportCSV("compliance.csv", csvRows)}>
              <Download className="h-4 w-4 mr-1.5" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportPDF("Compliance Report", csvRows)}>
              <FileText className="h-4 w-4 mr-1.5" /> PDF
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Compliant" value={okCount} tone="success" icon={<CheckCircle2 className="h-4 w-4 text-success" />} />
        <KpiCard label="Expiring ≤ 60d" value={soon.length} tone={soon.length ? "warning" : "default"} icon={<Clock className="h-4 w-4 text-warning" />} />
        <KpiCard label="Expired" value={expired.length} tone={expired.length ? "warning" : "default"} icon={<AlertTriangle className="h-4 w-4 text-destructive" />} />
        <KpiCard label="Suspended" value={suspended.length} tone={suspended.length ? "warning" : "default"} icon={<ShieldAlert className="h-4 w-4 text-destructive" />} />
      </div>

      <div className="flex gap-2">
        <Input placeholder="Search driver or license…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="text-right">Safety</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ d, days }) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell className="font-mono">{d.licenseNumber}</TableCell>
                <TableCell>{d.licenseCategory}</TableCell>
                <TableCell className={`font-mono ${days < 0 ? "text-destructive" : days < 60 ? "text-warning" : ""}`}>
                  {d.licenseExpiry} · {days < 0 ? `expired ${-days}d ago` : `${days}d left`}
                </TableCell>
                <TableCell className="text-right font-mono">{d.safetyScore}</TableCell>
                <TableCell><StatusPill status={d.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {days < 60 && <Button size="sm" variant="outline" onClick={() => sendReminder(d.name)}>Send reminder</Button>}
                    {d.status !== "Suspended" ? (
                      <Button size="sm" variant="ghost" onClick={() => {
                        if (!confirm(`Suspend ${d.name}?`)) return;
                        update((s) => ({ ...s, drivers: s.drivers.map((x) => x.id === d.id ? { ...x, status: "Suspended" } : x) }));
                        toast.success("Driver suspended");
                      }}>Suspend</Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => {
                        update((s) => ({ ...s, drivers: s.drivers.map((x) => x.id === d.id ? { ...x, status: "Available" } : x) }));
                        toast.success("Driver reinstated");
                      }}>Reinstate</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No drivers.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
