const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const FuelLog = require('../models/FuelLog');

// @desc   Create a new trip (status = Draft)
// @route  POST /api/trips
// @access Private (Driver / Fleet Manager)
// Business rules (cargo weight vs capacity, vehicle/driver availability, license
// validity) are enforced in the Trip model's pre('validate') hook.
exports.createTrip = async (req, res) => {
  try {
    const { source, destination, vehicle, driver, cargoWeight, plannedDistance } = req.body;

    if (!source || !destination || !vehicle || !driver || cargoWeight == null || plannedDistance == null) {
      return res.status(400).json({
        message: 'source, destination, vehicle, driver, cargoWeight, and plannedDistance are required',
      });
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

    await trip.save();

    return res.status(201).json({ message: 'Trip created successfully', trip });
  } catch (error) {
    // Validation errors from the pre('validate') hook surface here
    return res.status(400).json({ message: 'Failed to create trip', error: error.message });
  }
};

// @desc   Start (dispatch) a trip — sets vehicle & driver to "On Trip"
// @route  PUT /api/trips/:id/start
// @access Private (Driver / Fleet Manager)
exports.startTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status !== 'Draft') {
      return res.status(400).json({ message: `Trip cannot be started from status "${trip.status}"` });
    }

    // Re-validate current availability, in case something changed since trip creation
    const vehicle = await Vehicle.findById(trip.vehicle);
    const driver = await Driver.findById(trip.driver);

    if (!vehicle || vehicle.status !== 'Available') {
      return res.status(400).json({ message: 'Vehicle is no longer available for dispatch' });
    }
    if (!driver || driver.status !== 'Available') {
      return res.status(400).json({ message: 'Driver is no longer available for dispatch' });
    }
    if (driver.licenseExpiryDate < new Date()) {
      return res.status(400).json({ message: 'Driver license has expired' });
    }

    await trip.dispatch(); // sets trip=Dispatched, vehicle=On Trip, driver=On Trip

    return res.status(200).json({ message: 'Trip started (dispatched) successfully', trip });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to start trip', error: error.message });
  }
};

// @desc   End (complete) a trip — sets vehicle & driver back to "Available"
// @route  PUT /api/trips/:id/end
// @access Private (Driver / Fleet Manager)
exports.endTrip = async (req, res) => {
  try {
    const { finalOdometer, fuelConsumed } = req.body;

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (trip.status !== 'Dispatched') {
      return res.status(400).json({ message: `Only a dispatched trip can be completed (current status: "${trip.status}")` });
    }

    const vehicle = await Vehicle.findById(trip.vehicle);
    if (!vehicle) {
      return res.status(404).json({ message: 'Associated vehicle not found' });
    }

    if (finalOdometer != null && finalOdometer < vehicle.odometer) {
      return res.status(400).json({ message: 'Final odometer cannot be less than the current odometer reading' });
    }

    // Record actual distance travelled on the trip itself
    if (finalOdometer != null) {
      trip.actualDistance = finalOdometer - vehicle.odometer;
    }

    await trip.complete({ finalOdometer, fuelConsumed });

    return res.status(200).json({ message: 'Trip completed successfully', trip });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to complete trip', error: error.message });
  }
};

// @desc   Cancel a trip (Draft or Dispatched) — restores vehicle/driver if needed
// @route  PUT /api/trips/:id/cancel
// @access Private (Driver / Fleet Manager)
exports.cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (!['Draft', 'Dispatched'].includes(trip.status)) {
      return res.status(400).json({ message: `Trip cannot be cancelled from status "${trip.status}"` });
    }

    await trip.cancel();

    return res.status(200).json({ message: 'Trip cancelled successfully', trip });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to cancel trip', error: error.message });
  }
};

// @desc   Calculate distance and estimated operational cost for a completed trip
// @route  GET /api/trips/:id/metrics
// @access Private (Financial Analyst / Fleet Manager)
exports.calculateDistanceAndCost = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('vehicle driver');
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const distance = trip.actualDistance || trip.plannedDistance || 0;
    const fuelConsumed = trip.fuelConsumed || 0;

    // Fuel efficiency for this trip (distance per liter)
    const fuelEfficiency = fuelConsumed > 0 ? distance / fuelConsumed : null;

    // Estimate fuel cost using the average cost-per-liter from this vehicle's
    // fuel log history, so cost figures stay consistent with logged prices
    const fuelLogs = await FuelLog.find({ vehicle: trip.vehicle._id || trip.vehicle });
    let avgCostPerLiter = 0;
    if (fuelLogs.length > 0) {
      const totalLiters = fuelLogs.reduce((sum, log) => sum + log.liters, 0);
      const totalCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
      avgCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;
    }

    const estimatedFuelCost = fuelConsumed * avgCostPerLiter;

    return res.status(200).json({
      tripId: trip._id,
      distance,
      fuelConsumed,
      fuelEfficiency, // distance / fuel
      avgCostPerLiter,
      estimatedFuelCost,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to calculate trip metrics', error: error.message });
  }
};

// @desc   Get all trips, with optional filters
// @route  GET /api/trips?status=&vehicle=&driver=
// @access Private
exports.getAllTrips = async (req, res) => {
  try {
    const { status, vehicle, driver } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (vehicle) filter.vehicle = vehicle;
    if (driver) filter.driver = driver;

    const trips = await Trip.find(filter)
      .populate('vehicle', 'registrationNumber name status')
      .populate('driver', 'name licenseNumber status')
      .sort({ createdAt: -1 });

    return res.status(200).json({ count: trips.length, trips });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch trips', error: error.message });
  }
};