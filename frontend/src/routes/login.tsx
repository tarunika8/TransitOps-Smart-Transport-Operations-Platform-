import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { ROLE_HOME } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Truck } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { auth, login } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState("dispatch@transitops.dev");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  if (auth) return <Navigate to={ROLE_HOME[auth.role]} replace />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = login(email.trim(), password);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error ?? "Login failed");
      return;
    }
    const stored = JSON.parse(localStorage.getItem("transitops.auth.v1") || "null");
    toast.success(`Welcome, ${stored?.name ?? ""}`);
    nav({ to: ROLE_HOME[stored.role as keyof typeof ROLE_HOME] });
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground grid lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-sidebar text-sidebar-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,_currentColor_1px,_transparent_0)] [background-size:24px_24px]" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground grid place-items-center">
            <Truck className="h-5 w-5" />
          </div>
          <div className="font-display text-2xl font-bold tracking-tight">TransitOps</div>
        </div>
        <div className="relative z-10 space-y-4">
          <div className="inline-block rounded-full border border-sidebar-border px-3 py-1 text-xs uppercase tracking-widest text-sidebar-foreground/70">
            Operations Control Room
          </div>
          <h1 className="font-display text-5xl font-semibold leading-tight">
            One console for every<br />vehicle, driver & trip.
          </h1>
          <p className="max-w-md text-sm text-sidebar-foreground/70">
            Dispatch smarter. Track compliance. Kill spreadsheets.
          </p>
        </div>
        <div className="relative z-10 font-mono text-[11px] text-sidebar-foreground/50">
          v1.0 · secure by default · rbac
        </div>
      </div>

      {/* Login form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <form onSubmit={submit} className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center">
              <Truck className="h-4 w-4" />
            </div>
            <div className="font-display text-xl font-bold">TransitOps</div>
          </div>
          <div>
            <h2 className="font-display text-3xl font-semibold">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use your work email to access the platform.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" required
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>

          <div className="rounded-lg border border-border bg-muted/40 p-3 text-[11px] font-mono leading-relaxed text-muted-foreground">
            <div className="mb-1 uppercase tracking-widest">Demo accounts · password: demo1234</div>
            <div>fleet@transitops.dev · Fleet Manager</div>
            <div>dispatch@transitops.dev · Dispatcher</div>
            <div>safety@transitops.dev · Safety Officer</div>
            <div>finance@transitops.dev · Financial Analyst</div>
          </div>
        </form>
      </div>
    </div>
  );
}
