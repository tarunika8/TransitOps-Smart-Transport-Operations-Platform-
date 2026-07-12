/**
 * constants.js
 * Centralized enum-style constants so status/role strings aren't scattered
 * (and potentially mistyped) across models, services, and controllers.
 */

// Roles available for RBAC-based access control
export const USER_ROLES = Object.freeze({
  FLEET_MANAGER: 'Fleet Manager',
  DRIVER: 'Driver',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
});

// Vehicle lifecycle statuses
export const VEHICLE_STATUS = Object.freeze({
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  IN_SHOP: 'In Shop',
  RETIRED: 'Retired',
});

// Trip lifecycle statuses
export const TRIP_STATUS = Object.freeze({
  DRAFT: 'Draft',
  DISPATCHED: 'Dispatched',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
});

// Maintenance record statuses
export const MAINTENANCE_STATUS = Object.freeze({
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
});

// Convenience arrays, handy for Mongoose `enum` validators or input checks
export const ALL_USER_ROLES = Object.values(USER_ROLES);
export const ALL_VEHICLE_STATUSES = Object.values(VEHICLE_STATUS);
export const ALL_TRIP_STATUSES = Object.values(TRIP_STATUS);
export const ALL_MAINTENANCE_STATUSES = Object.values(MAINTENANCE_STATUS);

export default {
  USER_ROLES,
  VEHICLE_STATUS,
  TRIP_STATUS,
  MAINTENANCE_STATUS,
  ALL_USER_ROLES,
  ALL_VEHICLE_STATUSES,
  ALL_TRIP_STATUSES,
  ALL_MAINTENANCE_STATUSES,
};