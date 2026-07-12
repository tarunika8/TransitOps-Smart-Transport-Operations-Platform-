import { createFileRoute, Link, Outlet, useNavigate, useRouterState, Navigate } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { ROLE_LABEL, ROLE_NAV, NAV_PATH, ROLE_HOME, canAccessPath, type NavKey } from "@/lib/rbac";
import {
  LayoutDashboard, Truck, Users, Route as RouteIcon, Wrench, Fuel, BarChart3, ShieldCheck, LogOut, Moon, Sun, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

const NAV_META: Record<NavKey, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  dashboard: { label: "Dashboard", icon: LayoutDashboard },
  fleet: { label: "Fleet", icon: Truck },
  drivers: { label: "Drivers", icon: Users },
  trips: { label: "Trips", icon: RouteIcon },
  maintenance: { label: "Maintenance", icon: Wrench },
  compliance: { label: "Compliance", icon: ShieldCheck },
  expenses: { label: "Fuel & Expenses", icon: Fuel },
  analytics: { label: "Analytics", icon: BarChart3 },
};

function AppLayout() {
  const { auth, logout, state } = useStore();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const expiringSoon = useMemo(() => {
    const now = new Date();
    return state.drivers.filter((d) => differenceInDays(parseISO(d.licenseExpiry), now) <= 60);
  }, [state.drivers]);

  if (!auth) return <Navigate to="/login" replace />;

  // Enforce RBAC — redirect to role home if user navigates to a page they can't access.
  if (path === "/app" || path === "/app/") return <Navigate to={ROLE_HOME[auth.role]} replace />;
  if (!canAccessPath(auth.role, path)) return <Navigate to={ROLE_HOME[auth.role]} replace />;

  const navKeys = ROLE_NAV[auth.role];

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    nav({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
        <div className="p-5 flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <div className="font-display text-lg font-bold leading-none">TransitOps</div>
            <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60 mt-1">
              Ops Console
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navKeys.map((k) => {
            const m = NAV_META[k];
            const to = NAV_PATH[k];
            const active = path.startsWith(to);
            const Icon = m.icon;
            return (
              <Link
                key={k}
                to={to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="rounded-lg bg-sidebar-accent/60 p-3">
            <div className="text-xs font-medium">{auth.name}</div>
            <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60 mt-0.5">
              {ROLE_LABEL[auth.role]}
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-6">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {path.replace("/app/", "") || "home"}
          </div>
          <div className="flex items-center gap-2">
            {expiringSoon.length > 0 && auth.role === "SafetyOfficer" && (
              <div className="hidden md:flex items-center gap-1.5 rounded-full bg-warning/15 border border-warning/30 px-3 py-1 text-xs">
                <Bell className="h-3 w-3 text-warning" />
                <span className="text-foreground">{expiringSoon.length} license(s) expiring soon</span>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1.5" /> Sign out
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
