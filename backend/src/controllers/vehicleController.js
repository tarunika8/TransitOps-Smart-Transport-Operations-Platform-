const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

// @desc   Add a new vehicle
// @route  POST /api/vehicles
// @access Private (Fleet Manager)
exports.addVehicle = async (req, res) => {
  try {
    const {
      registrationNumber,
      name,
      type,
      maxLoadCapacity,
      odometer,
      acquisitionCost,
      status,
    } = req.body;

    if (!registrationNumber || !name || !type || maxLoadCapacity == null || acquisitionCost == null) {
      return res.status(400).json({
        message: 'registrationNumber, name, type, maxLoadCapacity, and acquisitionCost are required',
      });
    }

    // Enforce uniqueness explicitly for a clean error message
    const existing = await Vehicle.findOne({
      registrationNumber: registrationNumber.trim().toUpperCase(),
    });
    if (existing) {
      return res.status(409).json({ message: 'A vehicle with this registration number already exists' });
    }

    const vehicle = await Vehicle.create({
      registrationNumber,
      name,
      type,
      maxLoadCapacity,
      odometer,
      acquisitionCost,
      status,
    });

    return res.status(201).json({ message: 'Vehicle added successfully', vehicle });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A vehicle with this registration number already exists' });
    }
    return res.status(500).json({ message: 'Failed to add vehicle', error: error.message });
  }
};

// @desc   Update a vehicle
// @route  PUT /api/vehicles/:id
// @access Private (Fleet Manager)
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Registration number should not be changed once set; ignore if provided
    delete updates.registrationNumber;

    const validStatuses = ['Available', 'On Trip', 'In Shop', 'Retired'];
    if (updates.status && !validStatuses.includes(updates.status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const vehicle = await Vehicle.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    return res.status(200).json({ message: 'Vehicle updated successfully', vehicle });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update vehicle', error: error.message });
  }
};

// @desc   Delete a vehicle
// @route  DELETE /api/vehicles/:id
// @access Private (Fleet Manager)
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Guard: don't delete a vehicle that is currently on an active trip
    const activeTrip = await Trip.findOne({ vehicle: id, status: 'Dispatched' });
    if (activeTrip) {
      return res.status(400).json({ message: 'Cannot delete a vehicle that is currently on a dispatched trip' });
    }

    const vehicle = await Vehicle.findByIdAndDelete(id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    return res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete vehicle', error: error.message });
  }
};

// @desc   Get all vehicles, with optional filters (type, status) and sorting
// @route  GET /api/vehicles?type=&status=&sortBy=&order=
// @access Private
exports.getAllVehicles = async (req, res) => {
  try {
    const { type, status, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const vehicles = await Vehicle.find(filter).sort({ [sortBy]: order === 'asc' ? 1 : -1 });

    return res.status(200).json({ count: vehicles.length, vehicles });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch vehicles', error: error.message });
  }
};

// @desc   Get a single vehicle by id
// @route  GET /api/vehicles/:id
// @access Private
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    return res.status(200).json({ vehicle });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch vehicle', error: error.message });
  }
};