import Vehicle from "../models/Vehicle.js";
import Driver from "../models/Driver.js";
import Trip from "../models/Trip.js";
import Maintenance from "../models/Maintenance.js";
import FuelLog from "../models/FuelLog.js";
import Expense from "../models/Expense.js";

// @desc   Get top-level dashboard KPIs
// @route  GET /api/dashboard
// @access Private
const getDashboardStats = async (req, res) => {
  try {
    const { type, status, region } = req.query;

    const vehicleFilter = {};

    if (type) vehicleFilter.type = type;
    if (status) vehicleFilter.status = status;
    if (region) vehicleFilter.region = region;

    // Vehicle counts
    const [
      totalVehicles,
      activeVehicles,
      availableVehicles,
      vehiclesInMaintenance,
      retiredVehicles,
    ] = await Promise.all([
      Vehicle.countDocuments(vehicleFilter),
      Vehicle.countDocuments({
        ...vehicleFilter,
        status: { $ne: "Retired" },
      }),
      Vehicle.countDocuments({
        ...vehicleFilter,
        status: "Available",
      }),
      Vehicle.countDocuments({
        ...vehicleFilter,
        status: "In Shop",
      }),
      Vehicle.countDocuments({
        ...vehicleFilter,
        status: "Retired",
      }),
    ]);

    // Trip counts
    const [activeTrips, pendingTrips, completedTrips] =
      await Promise.all([
        Trip.countDocuments({ status: "Dispatched" }),
        Trip.countDocuments({ status: "Draft" }),
        Trip.countDocuments({ status: "Completed" }),
      ]);

    // Driver counts
    const [driversOnDuty, driversAvailable] =
      await Promise.all([
        Driver.countDocuments({ status: "On Trip" }),
        Driver.countDocuments({ status: "Available" }),
      ]);

    // Fleet utilization
    const vehiclesOnTrip = await Vehicle.countDocuments({
      ...vehicleFilter,
      status: "On Trip",
    });

    const fleetUtilization =
      activeVehicles > 0
        ? (vehiclesOnTrip / activeVehicles) * 100
        : 0;

    // Fuel Usage
    const fuelAgg = await FuelLog.aggregate([
      {
        $group: {
          _id: null,
          totalLiters: { $sum: "$liters" },
          totalFuelCost: { $sum: "$cost" },
        },
      },
    ]);

    const totalLiters = fuelAgg[0]?.totalLiters || 0;
    const totalFuelCost = fuelAgg[0]?.totalFuelCost || 0;

    // Expenses
    const [expenseAgg, maintenanceAgg] =
      await Promise.all([
        Expense.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
            },
          },
        ]),
        Maintenance.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: "$cost" },
            },
          },
        ]),
      ]);

    const totalExpenses = expenseAgg[0]?.total || 0;
    const totalMaintenanceCost = maintenanceAgg[0]?.total || 0;

    const totalOperationalCost =
      totalFuelCost +
      totalMaintenanceCost +
      totalExpenses;

    // Upcoming maintenance
    const upcomingMaintenance = await Maintenance.find({
      status: "Open",
    })
      .populate("vehicle", "registrationNumber name")
      .sort({ date: 1 })
      .limit(10);

    // Expiring Licenses
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    const expiringLicenses = await Driver.find({
      licenseExpiryDate: {
        $gte: new Date(),
        $lte: in30Days,
      },
      status: {
        $ne: "Suspended",
      },
    }).select(
      "name licenseNumber licenseExpiryDate"
    );

    res.status(200).json({
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
        fleetUtilization: Number(
          fleetUtilization.toFixed(2)
        ),
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
    res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

export default {
  getDashboardStats,
};