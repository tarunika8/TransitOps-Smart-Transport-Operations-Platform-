import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { KpiCard, PageHeader } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, FileText } from "lucide-react";
import { exportCSV, exportPDF } from "@/lib/exports";

export const Route = createFileRoute("/app/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { state } = useStore();

  const perVehicle = useMemo(() => state.vehicles.map((v) => {
    const trips = state.trips.filter((t) => t.vehicleId === v.id && t.status === "Completed");
    const km = trips.reduce((a, t) => a + (t.actualDistance ?? 0), 0);
    const fuelL = state.fuel.filter((f) => f.vehicleId === v.id).reduce((a, f) => a + f.liters, 0);
    const fuelCost = state.fuel.filter((f) => f.vehicleId === v.id).reduce((a, f) => a + f.cost, 0);
    const maint = state.maintenance.filter((m) => m.vehicleId === v.id).reduce((a, m) => a + m.cost, 0);
    const revenue = trips.reduce((a, t) => a + (t.revenue ?? 0), 0);
    const efficiency = fuelL > 0 ? km / fuelL : 0;
    const roi = v.acquisitionCost > 0 ? ((revenue - (maint + fuelCost)) / v.acquisitionCost) * 100 : 0;
    return { v, km, fuelL, fuelCost, maint, revenue, efficiency, roi, opCost: fuelCost + maint };
  }), [state]);

  const avgEfficiency = (() => {
    const rows = perVehicle.filter((r) => r.efficiency > 0);
    return rows.length ? rows.reduce((a, r) => a + r.efficiency, 0) / rows.length : 0;
  })();

  const totalOpCost = perVehicle.reduce((a, r) => a + r.opCost, 0);
  const totalRevenue = perVehicle.reduce((a, r) => a + r.revenue, 0);
  const activeVehicles = state.vehicles.filter((v) => v.status === "On Trip").length;
  const utilization = state.vehicles.length ? Math.round((activeVehicles / state.vehicles.length) * 100) : 0;

  const monthly = useMemo(() => {
    const map = new Map<string, number>();
    state.trips.forEach((t) => {
      if (t.status !== "Completed") return;
      const key = (t.completedAt ?? t.createdAt).slice(0, 7);
      map.set(key, (map.get(key) ?? 0) + (t.actualDistance ?? 0));
    });
    return Array.from(map.entries()).sort().map(([month, km]) => ({ month, km }));
  }, [state.trips]);

  const statusPie = ["Available", "On Trip", "In Shop", "Retired"].map((s) => ({
    name: s, value: state.vehicles.filter((v) => v.status === s).length,
  }));
  const PIE_COLORS = ["var(--color-chart-3)", "var(--color-chart-2)", "var(--color-chart-4)", "var(--color-chart-5)"];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Fuel efficiency, utilization and vehicle ROI"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => exportCSV("analytics.csv", perVehicle.map((r) => ({ Vehicle: r.v.regNumber, Km: r.km, Litres: r.fuelL, Efficiency_km_per_L: r.efficiency.toFixed(2), OpCost: r.opCost, Revenue: r.revenue, ROI_pct: r.roi.toFixed(1) })))}><Download className="h-4 w-4 mr-1.5" />CSV</Button>
            <Button variant="outline" size="sm" onClick={() => exportPDF("Analytics Report", perVehicle.map((r) => ({ Vehicle: r.v.regNumber, Km: r.km, Efficiency: `${r.efficiency.toFixed(2)} km/L`, OpCost: `₹${r.opCost.toLocaleString()}`, ROI: `${r.roi.toFixed(1)}%` })))}><FileText className="h-4 w-4 mr-1.5" />PDF</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Avg Fuel Efficiency" value={`${avgEfficiency.toFixed(1)} km/L`} tone="success" />
        <KpiCard label="Fleet Utilization" value={`${utilization}%`} tone="primary" />
        <KpiCard label="Operational Cost" value={`₹${totalOpCost.toLocaleString()}`} tone="warning" />
        <KpiCard label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} tone="info" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-display text-lg font-semibold mb-3">Monthly Mileage</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="km" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-display text-lg font-semibold mb-3">Fleet Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" outerRadius={80} label>
                  {statusPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
          <h3 className="font-display text-lg font-semibold mb-3">Vehicle Performance</h3>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-widest text-muted-foreground">
                <tr><th className="py-2">Vehicle</th><th className="text-right">Km</th><th className="text-right">Fuel</th><th className="text-right">Efficiency</th><th className="text-right">Op Cost</th><th className="text-right">Revenue</th><th className="text-right">ROI</th></tr>
              </thead>
              <tbody className="font-mono">
                {perVehicle.map((r) => (
                  <tr key={r.v.id} className="border-t border-border">
                    <td className="py-2">{r.v.regNumber}</td>
                    <td className="text-right">{r.km.toLocaleString()}</td>
                    <td className="text-right">{r.fuelL}L</td>
                    <td className="text-right">{r.efficiency.toFixed(2)}</td>
                    <td className="text-right">₹{r.opCost.toLocaleString()}</td>
                    <td className="text-right">₹{r.revenue.toLocaleString()}</td>
                    <td className={`text-right ${r.roi >= 0 ? "text-success" : "text-destructive"}`}>{r.roi.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
