const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');

// @desc   Add a fuel log entry for a vehicle
// @route  POST /api/fuel
// @access Private (Driver / Fleet Manager)
exports.addFuelLog = async (req, res) => {
  try {
    const { vehicle, liters, cost, date, distanceCovered } = req.body;

    if (!vehicle || liters == null || cost == null) {
      return res.status(400).json({ message: 'vehicle, liters, and cost are required' });
    }

    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const fuelLog = await FuelLog.create({
      vehicle,
      liters,
      cost,
      date,
      distanceCovered,
    });

    return res.status(201).json({ message: 'Fuel log added successfully', fuelLog });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add fuel log', error: error.message });
  }
};

// @desc   Calculate mileage / fuel efficiency for a vehicle over its fuel log history
// @route  GET /api/fuel/:vehicleId/mileage
// @access Private (Fleet Manager / Financial Analyst)
exports.calculateMileage = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const logs = await FuelLog.find({ vehicle: vehicleId }).sort({ date: 1 });

    if (logs.length === 0) {
      return res.status(200).json({
        vehicleId,
        message: 'No fuel logs found for this vehicle yet',
        totalDistance: 0,
        totalLiters: 0,
        averageMileage: 0,
      });
    }

    const totalDistance = logs.reduce((sum, log) => sum + (log.distanceCovered || 0), 0);
    const totalLiters = logs.reduce((sum, log) => sum + log.liters, 0);
    const averageMileage = totalLiters > 0 ? totalDistance / totalLiters : 0;

    return res.status(200).json({
      vehicleId,
      totalDistance,
      totalLiters,
      averageMileage, // distance per liter, i.e. fuel efficiency
      logCount: logs.length,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to calculate mileage', error: error.message });
  }
};

// @desc   Get fuel log history, optionally filtered by vehicle or date range
// @route  GET /api/fuel?vehicle=&from=&to=
// @access Private
exports.getFuelHistory = async (req, res) => {
  try {
    const { vehicle, from, to } = req.query;

    const filter = {};
    if (vehicle) filter.vehicle = vehicle;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const history = await FuelLog.find(filter)
      .populate('vehicle', 'registrationNumber name')
      .sort({ date: -1 });

    const totalCost = history.reduce((sum, log) => sum + log.cost, 0);
    const totalLiters = history.reduce((sum, log) => sum + log.liters, 0);

    return res.status(200).json({ count: history.length, totalCost, totalLiters, history });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch fuel history', error: error.message });
  }
};