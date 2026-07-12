const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Maintenance = require('../models/Maintenance');
const FuelLog = require('../models/FuelLog');
const Expense = require('../models/Expense');

/**
 * Count vehicles by status, optionally scoped by type/status/region filters
 * (region is reserved for when that field is added to the Vehicle schema).
 */
const getVehicleStats = async (filters = {}) => {
  const query = {};
  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;
  if (filters.region) query.region = filters.region;

  const [total, active, available, inMaintenance, retired, onTrip] = await Promise.all([
    Vehicle.countDocuments(query),
    Vehicle.countDocuments({ ...query, status: { $ne: 'Retired' } }),
    Vehicle.countDocuments({ ...query, status: 'Available' }),
    Vehicle.countDocuments({ ...query, status: 'In Shop' }),
    Vehicle.countDocuments({ ...query, status: 'Retired' }),
    Vehicle.countDocuments({ ...query, status: 'On Trip' }),
  ]);

  return { total, active, available, inMaintenance, retired, onTrip };
};

/**
 * Fleet utilization = percentage of currently-active (non-retired) vehicles
 * that are on a trip right now.
 */
const calculateFleetUtilization = (vehicleStats) => {
  const { active, onTrip } = vehicleStats;
  if (!active) return 0;
  return Number(((onTrip / active) * 100).toFixed(2));
};

/**
 * Count trips by lifecycle status (active/pending/completed).
 */
const getTripStats = async () => {
  const [activeTrips, pendingTrips, completedTrips, cancelledTrips] = await Promise.all([
    Trip.countDocuments({ status: 'Dispatched' }),
    Trip.countDocuments({ status: 'Draft' }),
    Trip.countDocuments({ status: 'Completed' }),
    Trip.countDocuments({ status: 'Cancelled' }),
  ]);

  return { activeTrips, pendingTrips, completedTrips, cancelledTrips };
};

/**
 * Driver statistics: how many are on duty vs. available vs. suspended/off duty.
 */
const getDriverStats = async () => {
  const [onDuty, available, offDuty, suspended, total] = await Promise.all([
    Driver.countDocuments({ status: 'On Trip' }),
    Driver.countDocuments({ status: 'Available' }),
    Driver.countDocuments({ status: 'Off Duty' }),
    Driver.countDocuments({ status: 'Suspended' }),
    Driver.countDocuments({}),
  ]);

  return { total, onDuty, available, offDuty, suspended };
};

/**
 * Fleet-wide fuel statistics: total liters consumed and total fuel spend.
 */
const getFuelStats = async () => {
  const agg = await FuelLog.aggregate([
    {
      $group: {
        _id: null,
        totalLiters: { $sum: '$liters' },
        totalFuelCost: { $sum: '$cost' },
      },
    },
  ]);

  return {
    totalLiters: agg[0]?.totalLiters || 0,
    totalFuelCost: agg[0]?.totalFuelCost || 0,
  };
};

/**
 * Fleet-wide expense statistics: misc expenses + maintenance cost combined,
 * plus a grand total operational cost figure (fuel is added in by the caller
 * since it's fetched separately via getFuelStats).
 */
const getExpenseStats = async () => {
  const [expenseAgg, maintenanceAgg] = await Promise.all([
    Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    Maintenance.aggregate([{ $group: { _id: null, total: { $sum: '$cost' } } }]),
  ]);

  return {
    totalExpenses: expenseAgg[0]?.total || 0,
    totalMaintenanceCost: maintenanceAgg[0]?.total || 0,
  };
};

/**
 * Currently open maintenance records, soonest first — used for the
 * "upcoming maintenance" dashboard widget.
 */
const getUpcomingMaintenance = async (limit = 10) => {
  return Maintenance.find({ status: 'Open' })
    .populate('vehicle', 'registrationNumber name')
    .sort({ date: 1 })
    .limit(limit);
};

/**
 * Drivers whose license expires within the given number of days (default 30),
 * excluding those already suspended.
 */
const getLicenseExpiryAlerts = async (withinDays = 30) => {
  const now = new Date();
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + withinDays);

  return Driver.find({
    licenseExpiryDate: { $gte: now, $lte: threshold },
    status: { $ne: 'Suspended' },
  }).select('name licenseNumber licenseExpiryDate status');
};

/**
 * Assemble the full dashboard payload in one call: KPIs, fuel usage,
 * expense totals, upcoming maintenance, and license expiry alerts.
 */
const getDashboardOverview = async (filters = {}) => {
  const [vehicleStats, tripStats, driverStats, fuelStats, expenseStats, upcomingMaintenance, licenseAlerts] =
    await Promise.all([
      getVehicleStats(filters),
      getTripStats(),
      getDriverStats(),
      getFuelStats(),
      getExpenseStats(),
      getUpcomingMaintenance(),
      getLicenseExpiryAlerts(),
    ]);

  const fleetUtilization = calculateFleetUtilization(vehicleStats);
  const totalOperationalCost =
    fuelStats.totalFuelCost + expenseStats.totalMaintenanceCost + expenseStats.totalExpenses;

  return {
    kpis: {
      totalVehicles: vehicleStats.total,
      activeVehicles: vehicleStats.active,
      availableVehicles: vehicleStats.available,
      vehiclesInMaintenance: vehicleStats.inMaintenance,
      retiredVehicles: vehicleStats.retired,
      ...tripStats,
      driversOnDuty: driverStats.onDuty,
      driversAvailable: driverStats.available,
      fleetUtilization, // %
    },
    fuelUsage: fuelStats,
    expenses: {
      ...expenseStats,
      totalOperationalCost,
    },
    upcomingMaintenance,
    expiringLicenses: licenseAlerts,
  };
};

module.exports = {
  getVehicleStats,
  calculateFleetUtilization,
  getTripStats,
  getDriverStats,
  getFuelStats,
  getExpenseStats,
  getUpcomingMaintenance,
  getLicenseExpiryAlerts,
  getDashboardOverview,
};