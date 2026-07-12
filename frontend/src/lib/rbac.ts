import type { Role } from "./types";

export const ROLE_HOME: Record<Role, string> = {
  FleetManager: "/app/fleet",
  Dispatcher: "/app/dashboard",
  SafetyOfficer: "/app/drivers",
  FinancialAnalyst: "/app/expenses",
};

export const ROLE_LABEL: Record<Role, string> = {
  FleetManager: "Fleet Manager",
  Dispatcher: "Dispatcher",
  SafetyOfficer: "Safety Officer",
  FinancialAnalyst: "Financial Analyst",
};

export type NavKey =
  | "dashboard"
  | "fleet"
  | "drivers"
  | "trips"
  | "maintenance"
  | "compliance"
  | "expenses"
  | "analytics";

// Strict role scope: each role sees ONLY the pages listed.
export const ROLE_NAV: Record<Role, NavKey[]> = {
  FleetManager: ["fleet", "maintenance"],
  Dispatcher: ["dashboard", "trips"],
  SafetyOfficer: ["drivers", "compliance"],
  FinancialAnalyst: ["expenses", "analytics"],
};

export const NAV_PATH: Record<NavKey, string> = {
  dashboard: "/app/dashboard",
  fleet: "/app/fleet",
  drivers: "/app/drivers",
  trips: "/app/trips",
  maintenance: "/app/maintenance",
  compliance: "/app/compliance",
  expenses: "/app/expenses",
  analytics: "/app/analytics",
};

export function canAccessPath(role: Role, path: string) {
  return ROLE_NAV[role].some((k) => path.startsWith(NAV_PATH[k]));
}
