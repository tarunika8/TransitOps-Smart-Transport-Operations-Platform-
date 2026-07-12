import type { Driver, Expense, FuelLog, MaintenanceLog, Trip, User, Vehicle } from "./types";

export const SEED_USERS: (User & { password: string })[] = [
  { id: "u1", email: "fleet@transitops.dev", password: "demo1234", name: "Priya Sharma", role: "FleetManager" },
  { id: "u2", email: "dispatch@transitops.dev", password: "demo1234", name: "Arjun Rao", role: "Dispatcher" },
  { id: "u3", email: "safety@transitops.dev", password: "demo1234", name: "Meera Iyer", role: "SafetyOfficer" },
  { id: "u4", email: "finance@transitops.dev", password: "demo1234", name: "Kabir Menon", role: "FinancialAnalyst" },
];

export const SEED_VEHICLES: Vehicle[] = [
  { id: "v1", regNumber: "KA01AB1234", name: "Tata Ace Van-05", type: "Van", capacityKg: 500, odometer: 41200, acquisitionCost: 620000, status: "Available", documents: [{ name: "Insurance", expiry: "2026-08-14" }, { name: "PUC", expiry: "2026-03-01" }] },
  { id: "v2", regNumber: "KA05CD5678", name: "Ashok Leyland Dost", type: "Truck", capacityKg: 1500, odometer: 84300, acquisitionCost: 1240000, status: "On Trip" },
  { id: "v3", regNumber: "KA09EF4411", name: "Mahindra Bolero Pickup", type: "Pickup", capacityKg: 1200, odometer: 62450, acquisitionCost: 940000, status: "In Shop" },
  { id: "v4", regNumber: "KA03GH9021", name: "Eicher Pro 2049", type: "Truck", capacityKg: 3000, odometer: 15900, acquisitionCost: 1890000, status: "Available" },
  { id: "v5", regNumber: "KA07IJ7788", name: "Force Traveller", type: "Van", capacityKg: 800, odometer: 128700, acquisitionCost: 780000, status: "Retired" },
];

export const SEED_DRIVERS: Driver[] = [
  { id: "d1", name: "Alex Fernandes", licenseNumber: "DL-14-9931", licenseCategory: "LMV", licenseExpiry: "2027-05-10", contact: "+91 98450 11223", safetyScore: 94, status: "Available" },
  { id: "d2", name: "Ravi Kumar", licenseNumber: "DL-05-5540", licenseCategory: "HMV", licenseExpiry: "2025-11-30", contact: "+91 98867 44210", safetyScore: 88, status: "On Trip" },
  { id: "d3", name: "Sana Qureshi", licenseNumber: "DL-11-2210", licenseCategory: "LMV", licenseExpiry: "2026-02-18", contact: "+91 91765 20984", safetyScore: 96, status: "Off Duty" },
  { id: "d4", name: "George Thomas", licenseNumber: "DL-22-4098", licenseCategory: "HMV", licenseExpiry: "2024-12-01", contact: "+91 98220 09912", safetyScore: 71, status: "Suspended" },
];

export const SEED_TRIPS: Trip[] = [
  { id: "t1", source: "Bangalore Hub", destination: "Hosur Industrial", vehicleId: "v2", driverId: "d2", cargoKg: 1200, plannedDistance: 42, actualDistance: 45, fuelConsumed: 6, revenue: 4500, status: "Dispatched", createdAt: new Date(Date.now() - 3600e3).toISOString() },
  { id: "t2", source: "Bangalore Hub", destination: "Mysore Depot", vehicleId: "v1", driverId: "d1", cargoKg: 380, plannedDistance: 145, actualDistance: 148, fuelConsumed: 18, revenue: 12000, status: "Completed", createdAt: new Date(Date.now() - 7 * 86400e3).toISOString(), completedAt: new Date(Date.now() - 6 * 86400e3).toISOString() },
  { id: "t3", source: "Whitefield", destination: "Electronic City", vehicleId: "v4", driverId: "d1", cargoKg: 2400, plannedDistance: 34, status: "Draft", createdAt: new Date().toISOString() },
];

export const SEED_MAINT: MaintenanceLog[] = [
  { id: "m1", vehicleId: "v3", service: "Engine Repair", cost: 18000, date: new Date(Date.now() - 2 * 86400e3).toISOString(), closed: false, notes: "Turbo overhaul" },
  { id: "m2", vehicleId: "v1", service: "Oil Change", cost: 3200, date: new Date(Date.now() - 12 * 86400e3).toISOString(), closed: true },
];

export const SEED_FUEL: FuelLog[] = [
  { id: "f1", vehicleId: "v1", liters: 18, cost: 1980, date: new Date(Date.now() - 6 * 86400e3).toISOString() },
  { id: "f2", vehicleId: "v2", liters: 62, cost: 6820, date: new Date(Date.now() - 3 * 86400e3).toISOString() },
  { id: "f3", vehicleId: "v4", liters: 40, cost: 4400, date: new Date(Date.now() - 1 * 86400e3).toISOString() },
];

export const SEED_EXPENSES: Expense[] = [
  { id: "e1", vehicleId: "v2", category: "Toll", amount: 320, date: new Date(Date.now() - 3 * 86400e3).toISOString() },
  { id: "e2", vehicleId: "v1", category: "Parking", amount: 150, date: new Date(Date.now() - 6 * 86400e3).toISOString() },
];
