import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Driver, Expense, FuelLog, MaintenanceLog, Trip, User, Vehicle } from "./types";
import { SEED_DRIVERS, SEED_EXPENSES, SEED_FUEL, SEED_MAINT, SEED_TRIPS, SEED_USERS, SEED_VEHICLES } from "./seed";

const KEY = "transitops.state.v1";
const AUTH_KEY = "transitops.auth.v1";

export interface AppState {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenance: MaintenanceLog[];
  fuel: FuelLog[];
  expenses: Expense[];
}

const initial: AppState = {
  vehicles: SEED_VEHICLES,
  drivers: SEED_DRIVERS,
  trips: SEED_TRIPS,
  maintenance: SEED_MAINT,
  fuel: SEED_FUEL,
  expenses: SEED_EXPENSES,
};

function load(): AppState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw) };
  } catch {
    return initial;
  }
}
function save(s: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

interface Ctx {
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
  reset: () => void;
  auth: User | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initial);
  const [auth, setAuth] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    try {
      const a = localStorage.getItem(AUTH_KEY);
      if (a) setAuth(JSON.parse(a));
    } catch {}
    setHydrated(true);
  }, []);

  const update = (fn: (s: AppState) => AppState) =>
    setState((prev) => {
      const next = fn(prev);
      save(next);
      return next;
    });

  const reset = () => {
    setState(initial);
    save(initial);
  };

  const login = (email: string, password: string) => {
    const u = SEED_USERS.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if (!u) return { ok: false, error: "Invalid email or password." };
    const { password: _p, ...rest } = u;
    setAuth(rest);
    localStorage.setItem(AUTH_KEY, JSON.stringify(rest));
    return { ok: true };
  };
  const logout = () => {
    setAuth(null);
    localStorage.removeItem(AUTH_KEY);
  };

  if (!hydrated) return null;
  return <StoreCtx.Provider value={{ state, update, reset, auth, login, logout }}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
