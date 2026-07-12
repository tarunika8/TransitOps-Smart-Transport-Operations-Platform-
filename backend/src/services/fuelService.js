const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');
const AppError = require('../utils/AppError');

/**
 * Add a fuel log entry for a vehicle.
 * Validates required fields and that the vehicle actually exists.
 */
const addFuelLog = async ({ vehicle, liters, cost, date, distanceCovered }) => {
  if (!vehicle || liters == null || cost == null) {
    throw new AppError('vehicle, liters, and cost are required', 400);
  }

  if (liters <= 0) {
    throw new AppError('liters must be greater than zero', 400);
  }
  if (cost < 0) {
    throw new AppError('cost cannot be negative', 400);
  }

  const vehicleDoc = await Vehicle.findById(vehicle);
  if (!vehicleDoc) {
    throw new AppError('Vehicle not found', 404);
  }

  const fuelLog = await FuelLog.create({ vehicle, liters, cost, date, distanceCovered });
  return fuelLog;
};

/**
 * Get fuel log history, optionally filtered by vehicle and/or date range.
 */
const getFuelHistory = async ({ vehicle, from, to } = {}) => {
  const query = {};
  if (vehicle) query.vehicle = vehicle;
  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  return FuelLog.find(query).populate('vehicle', 'registrationNumber name').sort({ date: -1 });
};

/**
 * Calculate mileage (distance per liter) for a vehicle across its full fuel log history.
 * Returns totals plus the averaged mileage figure.
 */
const calculateMileage = async (vehicleId) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  const logs = await FuelLog.find({ vehicle: vehicleId }).sort({ date: 1 });

  if (logs.length === 0) {
    return { vehicleId, totalDistance: 0, totalLiters: 0, averageMileage: 0, logCount: 0 };
  }

  const totalDistance = logs.reduce((sum, log) => sum + (log.distanceCovered || 0), 0);
  const totalLiters = logs.reduce((sum, log) => sum + log.liters, 0);
  const averageMileage = totalLiters > 0 ? Number((totalDistance / totalLiters).toFixed(2)) : 0;

  return { vehicleId, totalDistance, totalLiters, averageMileage, logCount: logs.length };
};

/**
 * Calculate the average fuel consumption (liters per 100 km) for a vehicle.
 * This is the inverse framing of mileage, useful for cost-per-distance reporting.
 */
const calculateAverageFuelConsumption = async (vehicleId) => {
  const { totalDistance, totalLiters } = await calculateMileage(vehicleId);

  if (totalDistance === 0) {
    return { vehicleId, litersPer100Km: 0 };
  }

  const litersPer100Km = Number(((totalLiters / totalDistance) * 100).toFixed(2));
  return { vehicleId, litersPer100Km };
};

/**
 * Calculate total fuel cost for a vehicle, or across the whole fleet if no
 * vehicleId is provided.
 */
const calculateTotalFuelCost = async (vehicleId = null) => {
  const query = vehicleId ? { vehicle: vehicleId } : {};
  const logs = await FuelLog.find(query);
  const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
  const totalLiters = logs.reduce((sum, log) => sum + log.liters, 0);

  return { vehicleId, totalCost, totalLiters, logCount: logs.length };
};

module.exports = {
  addFuelLog,
  getFuelHistory,
  calculateMileage,
  calculateAverageFuelConsumption,
  calculateTotalFuelCost,
};