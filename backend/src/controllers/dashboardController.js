const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');
const Maintenance = require('../models/Maintenance');
const FuelLog = require('../models/FuelLog');
const Expense = require('../models/Expense');

// @desc   Get top-level dashboard KPIs
// @route  GET /api/dashboard
// @access Private
exports.getDashboardStats = async (req, res) => {
  try {
    const { type, status, region } = req.query;

    const vehicleFilter = {};
    if (type) vehicleFilter.type = type;
    if (status) vehicleFilter.status = status;
    if (region) vehicleFilter.region = region; // reserved for when region is added to the schema

    // --- Vehicle counts ---
    const [totalVehicles, activeVehicles, availableVehicles, vehiclesInMaintenance, retiredVehicles] =
      await Promise.all([
        Vehicle.countDocuments(vehicleFilter),
        Vehicle.countDocuments({ ...vehicleFilter, status: { $ne: 'Retired' } }),
        Vehicle.countDocuments({ ...vehicleFilter, status: 'Available' }),
        Vehicle.countDocuments({ ...vehicleFilter, status: 'In Shop' }),
        Vehicle.countDocuments({ ...vehicleFilter, status: 'Retired' }),
      ]);

    // --- Trip counts ---
    const [activeTrips, pendingTrips, completedTrips] = await Promise.all([
      Trip.countDocuments({ status: 'Dispatched' }),
      Trip.countDocuments({ status: 'Draft' }),
      Trip.countDocuments({ status: 'Completed' }),
    ]);

    // --- Driver counts ---
    const [driversOnDuty, driversAvailable] = await Promise.all([
      Driver.countDocuments({ status: 'On Trip' }),
      Driver.countDocuments({ status: 'Available' }),
    ]);

    // --- Fleet utilization: % of active vehicles currently on a trip ---
    const vehiclesOnTrip = await Vehicle.countDocuments({ ...vehicleFilter, status: 'On Trip' });
    const fleetUtilization = activeVehicles > 0 ? (vehiclesOnTrip / activeVehicles) * 100 : 0;

    // --- Fuel usage (all-time totals; could be scoped by date range if needed) ---
    const fuelAgg = await FuelLog.aggregate([
      {
        $group: {
          _id: null,
          totalLiters: { $sum: '$liters' },
          totalFuelCost: { $sum: '$cost' },
        },
      },
    ]);
    const totalLiters = fuelAgg[0]?.totalLiters || 0;
    const totalFuelCost = fuelAgg[0]?.totalFuelCost || 0;

    // --- Expenses & maintenance cost totals ---
    const [expenseAgg, maintenanceAgg] = await Promise.all([
      Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Maintenance.aggregate([{ $group: { _id: null, total: { $sum: '$cost' } } }]),
    ]);
    const totalExpenses = expenseAgg[0]?.total || 0;
    const totalMaintenanceCost = maintenanceAgg[0]?.total || 0;

    const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalExpenses;

    // --- Upcoming maintenance: currently open maintenance records ---
    const upcomingMaintenance = await Maintenance.find({ status: 'Open' })
      .populate('vehicle', 'registrationNumber name')
      .sort({ date: 1 })
      .limit(10);

    // --- Drivers with licenses expiring in the next 30 days (safety visibility) ---
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    const expiringLicenses = await Driver.find({
      licenseExpiryDate: { $gte: new Date(), $lte: in30Days },
      status: { $ne: 'Suspended' },
    }).select('name licenseNumber licenseExpiryDate');

    return res.status(200).json({
      kpis: {
        totalVehicles,
        activeVehicles,
        availableVehicles,
        vehiclesInMaintenance,
        retiredVehicles,
        activeTrips,
        pendingTrips,
        completedTrips,
        driversOnDuty,
        driversAvailable,
        fleetUtilization: Number(fleetUtilization.toFixed(2)), // %
      },
      fuelUsage: {
        totalLiters,
        totalFuelCost,
      },
      expenses: {
        totalExpenses,
        totalMaintenanceCost,
        totalOperationalCost,
      },
      upcomingMaintenance,
      expiringLicenses,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
};