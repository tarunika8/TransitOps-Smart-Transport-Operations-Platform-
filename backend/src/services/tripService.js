const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const AppError = require('../utils/AppError');

/**
 * Create a new trip in "Draft" status.
 * Cross-field validation (cargo weight vs. capacity, vehicle/driver availability,
 * license expiry) is enforced by the Trip model's pre('validate') hook; any
 * failure there is surfaced here as a 400.
 */
const createTrip = async ({ source, destination, vehicle, driver, cargoWeight, plannedDistance }) => {
  if (!source || !destination || !vehicle || !driver || cargoWeight == null || plannedDistance == null) {
    throw new AppError(
      'source, destination, vehicle, driver, cargoWeight, and plannedDistance are required',
      400
    );
  }

  const trip = new Trip({
    source,
    destination,
    vehicle,
    driver,
    cargoWeight,
    plannedDistance,
    status: 'Draft',
  });

  try {
    await trip.save();
  } catch (error) {
    throw new AppError(error.message, 400);
  }

  return trip;
};

/**
 * Start (dispatch) a trip.
 * - Re-validates that the vehicle and driver are still available (state may have
 *   changed since the trip was drafted).
 * - Automatically flips both vehicle and driver status to "On Trip".
 */
const startTrip = async (tripId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  if (trip.status !== 'Draft') {
    throw new AppError(`Trip cannot be started from status "${trip.status}"`, 400);
  }

  const [vehicle, driver] = await Promise.all([
    Vehicle.findById(trip.vehicle),
    Driver.findById(trip.driver),
  ]);

  if (!vehicle || vehicle.status !== 'Available') {
    throw new AppError('Vehicle is no longer available for dispatch', 400);
  }
  if (!driver || driver.status !== 'Available') {
    throw new AppError('Driver is no longer available for dispatch', 400);
  }
  if (driver.licenseExpiryDate < new Date()) {
    throw new AppError('Driver license has expired', 400);
  }

  trip.status = 'Dispatched';
  trip.dispatchedAt = new Date();
  await trip.save();

  await Promise.all([
    Vehicle.findByIdAndUpdate(vehicle._id, { status: 'On Trip' }),
    Driver.findByIdAndUpdate(driver._id, { status: 'On Trip' }),
  ]);

  return trip;
};

/**
 * Complete a trip.
 * - Only a "Dispatched" trip can be completed.
 * - Records final odometer/fuel consumed and derives actual distance travelled.
 * - Automatically restores both vehicle and driver status to "Available".
 */
const completeTrip = async (tripId, { finalOdometer, fuelConsumed } = {}) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  if (trip.status !== 'Dispatched') {
    throw new AppError(`Only a dispatched trip can be completed (current status: "${trip.status}")`, 400);
  }

  const vehicle = await Vehicle.findById(trip.vehicle);
  if (!vehicle) {
    throw new AppError('Associated vehicle not found', 404);
  }

  if (finalOdometer != null && finalOdometer < vehicle.odometer) {
    throw new AppError('Final odometer cannot be less than the current odometer reading', 400);
  }

  if (finalOdometer != null) {
    trip.actualDistance = finalOdometer - vehicle.odometer;
  }
  if (fuelConsumed !== undefined) {
    trip.fuelConsumed = fuelConsumed;
  }

  trip.status = 'Completed';
  trip.completedAt = new Date();
  await trip.save();

  const vehicleUpdate = { status: 'Available' };
  if (finalOdometer != null) vehicleUpdate.odometer = finalOdometer;

  await Promise.all([
    Vehicle.findByIdAndUpdate(vehicle._id, vehicleUpdate),
    Driver.findByIdAndUpdate(trip.driver, { status: 'Available' }),
  ]);

  return trip;
};

/**
 * Cancel a trip.
 * - Allowed from "Draft" or "Dispatched" status only.
 * - If the trip had already been dispatched, restores vehicle and driver to "Available".
 */
const cancelTrip = async (tripId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }

  if (!['Draft', 'Dispatched'].includes(trip.status)) {
    throw new AppError(`Trip cannot be cancelled from status "${trip.status}"`, 400);
  }

  const wasDispatched = trip.status === 'Dispatched';
  trip.status = 'Cancelled';
  await trip.save();

  if (wasDispatched) {
    await Promise.all([
      Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' }),
      Driver.findByIdAndUpdate(trip.driver, { status: 'Available' }),
    ]);
  }

  return trip;
};

/**
 * Calculate the duration (in hours, to 2 decimal places) of a trip between
 * dispatch and completion. Returns null if the trip hasn't been dispatched
 * and completed yet.
 */
const calculateTripDuration = (trip) => {
  if (!trip.dispatchedAt || !trip.completedAt) {
    return null;
  }
  const durationMs = new Date(trip.completedAt) - new Date(trip.dispatchedAt);
  return Number((durationMs / (1000 * 60 * 60)).toFixed(2)); // ms -> hours
};

/**
 * Fetch a single trip by id, with vehicle/driver populated.
 */
const getTripById = async (tripId) => {
  const trip = await Trip.findById(tripId).populate('vehicle').populate('driver');
  if (!trip) {
    throw new AppError('Trip not found', 404);
  }
  return trip;
};

/**
 * Fetch trips matching optional filters (status, vehicle, driver).
 */
const getAllTrips = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.vehicle) query.vehicle = filters.vehicle;
  if (filters.driver) query.driver = filters.driver;

  return Trip.find(query)
    .populate('vehicle', 'registrationNumber name status')
    .populate('driver', 'name licenseNumber status')
    .sort({ createdAt: -1 });
};

module.exports = {
  createTrip,
  startTrip,
  completeTrip,
  cancelTrip,
  calculateTripDuration,
  getTripById,
  getAllTrips,
};