export type Role = "FleetManager" | "Dispatcher" | "SafetyOfficer" | "FinancialAnalyst";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired";
export interface Vehicle {
  id: string;
  regNumber: string;
  name: string;
  type: string;
  capacityKg: number;
  odometer: number;
  acquisitionCost: number;
  status: VehicleStatus;
  documents?: { name: string; expiry?: string; note?: string }[];
}

export type DriverStatus = "Available" | "On Trip" | "Off Duty" | "Suspended";
export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  contact: string;
  safetyScore: number;
  status: DriverStatus;
}

export type TripStatus = "Draft" | "Dispatched" | "Completed" | "Cancelled";
export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoKg: number;
  plannedDistance: number;
  actualDistance?: number;
  fuelConsumed?: number;
  revenue?: number;
  status: TripStatus;
  createdAt: string;
  completedAt?: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  service: string;
  cost: number;
  date: string;
  closed: boolean;
  notes?: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  liters: number;
  cost: number;
  date: string;
}

export interface Expense {
  id: string;
  vehicleId?: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
}
