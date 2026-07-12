import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function KpiCard({
  label, value, hint, tone = "default", icon,
}: {
  label: string; value: ReactNode; hint?: string;
  tone?: "default" | "success" | "warning" | "info" | "primary";
  icon?: ReactNode;
}) {
  const tones = {
    default: "border-border",
    success: "border-success/40 bg-success/5",
    warning: "border-warning/40 bg-warning/5",
    info: "border-info/40 bg-info/5",
    primary: "border-primary/40 bg-primary/5",
  };
  return (
    <div className={cn("rounded-xl border p-4 bg-card", tones[tone])}>
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        {icon}
      </div>
      <div className="mt-2 font-display text-3xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Available: "bg-success/15 text-success border-success/30",
    "On Trip": "bg-info/15 text-info border-info/30",
    "In Shop": "bg-warning/15 text-warning border-warning/30",
    Retired: "bg-muted text-muted-foreground border-border",
    "Off Duty": "bg-muted text-muted-foreground border-border",
    Suspended: "bg-destructive/15 text-destructive border-destructive/30",
    Draft: "bg-muted text-muted-foreground border-border",
    Dispatched: "bg-info/15 text-info border-info/30",
    Completed: "bg-success/15 text-success border-success/30",
    Cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", map[status] ?? "bg-muted text-muted-foreground border-border")}>
      {status}
    </span>
  );
}
