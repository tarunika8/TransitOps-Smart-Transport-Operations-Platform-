import Maintenance from '../models/Maintenance.js';
import Vehicle from '../models/Vehicle.js';
import AppError from '../utils/AppError.js';

const VALID_STATUSES = ['Open', 'Closed'];

/**
 * Schedule a new maintenance record for a vehicle.
 * Business rule: an Open record automatically switches the vehicle's status
 * to "In Shop" (handled by the Maintenance model's post-save hook), which
 * removes it from the dispatch/driver selection pool.
 */
export const scheduleMaintenance = async ({ vehicle, maintenanceType, date, cost, notes }) => {
  if (!vehicle || !maintenanceType || cost == null) {
    throw new AppError('vehicle, maintenanceType, and cost are required', 400);
  }
  if (cost < 0) {
    throw new AppError('cost cannot be negative', 400);
  }

  const vehicleDoc = await Vehicle.findById(vehicle);
  if (!vehicleDoc) {
    throw new AppError('Vehicle not found', 404);
  }

  if (vehicleDoc.status === 'On Trip') {
    throw new AppError('Cannot schedule maintenance while the vehicle is on an active trip', 400);
  }

  const maintenance = await Maintenance.create({
    vehicle,
    maintenanceType,
    date,
    cost,
    notes,
    status: 'Open',
  });

  return maintenance;
};

/**
 * Update a maintenance record's status.
 * Business rule: closing a record restores the vehicle to "Available"
 * (unless the vehicle has been Retired) — handled via the model's close() method.
 */
export const updateMaintenanceStatus = async (maintenanceId, status) => {
  if (!status || !VALID_STATUSES.includes(status)) {
    throw new AppError(`status must be one of: ${VALID_STATUSES.join(', ')}`, 400);
  }

  const maintenance = await Maintenance.findById(maintenanceId);
  if (!maintenance) {
    throw new AppError('Maintenance record not found', 404);
  }

  if (status === 'Closed') {
    await maintenance.close();
  } else {
    maintenance.status = status;
    await maintenance.save();
  }

  return maintenance;
};

/**
 * Get maintenance history, optionally filtered by vehicle and/or status.
 * Also returns the total cost across the returned records.
 */
export const getMaintenanceHistory = async ({ vehicle, status } = {}) => {
  const query = {};
  if (vehicle) query.vehicle = vehicle;
  if (status) query.status = status;

  const history = await Maintenance.find(query)
    .populate('vehicle', 'registrationNumber name')
    .sort({ date: -1 });

  const totalCost = history.reduce((sum, record) => sum + record.cost, 0);

  return { count: history.length, totalCost, history };
};

/**
 * Calculate total maintenance cost, either for one vehicle or fleet-wide.
 */
export const calculateMaintenanceCost = async (vehicleId = null) => {
  const query = vehicleId ? { vehicle: vehicleId } : {};
  const records = await Maintenance.find(query);
  const totalCost = records.reduce((sum, r) => sum + r.cost, 0);

  return { vehicleId, totalCost, recordCount: records.length };
};

/**
 * Get all currently open (upcoming/in-progress) maintenance records,
 * most urgent (earliest date) first.
 */
export const getUpcomingMaintenance = async (limit = 10) => {
  return Maintenance.find({ status: 'Open' })
    .populate('vehicle', 'registrationNumber name')
    .sort({ date: 1 })
    .limit(limit);
};

export default {
  scheduleMaintenance,
  updateMaintenanceStatus,
  getMaintenanceHistory,
  calculateMaintenanceCost,
  getUpcomingMaintenance,
};