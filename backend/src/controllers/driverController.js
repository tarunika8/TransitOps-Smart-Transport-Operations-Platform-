const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

// @desc   Add a new driver
// @route  POST /api/drivers
// @access Private (Safety Officer / Fleet Manager)
exports.addDriver = async (req, res) => {
  try {
    const {
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore,
      status,
    } = req.body;

    if (!name || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber) {
      return res.status(400).json({
        message: 'name, licenseNumber, licenseCategory, licenseExpiryDate, and contactNumber are required',
      });
    }

    const existing = await Driver.findOne({ licenseNumber: licenseNumber.trim() });
    if (existing) {
      return res.status(409).json({ message: 'A driver with this license number already exists' });
    }

    const driver = await Driver.create({
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      safetyScore,
      status,
    });

    return res.status(201).json({ message: 'Driver added successfully', driver });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A driver with this license number already exists' });
    }
    return res.status(500).json({ message: 'Failed to add driver', error: error.message });
  }
};

// @desc   Check/confirm a driver can be assigned to a vehicle (pre-trip eligibility check)
// @route  POST /api/drivers/:driverId/assign/:vehicleId
// @access Private (Driver / Fleet Manager)
// Note: the actual assignment record is created via tripController.createTrip,
// which links the driver + vehicle on a Trip document. This endpoint validates
// eligibility ahead of time so the UI can surface clear errors before trip creation.
exports.assignDriverToVehicle = async (req, res) => {
  try {
    const { driverId, vehicleId } = req.params;

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const reasons = [];

    if (driver.status !== 'Available') {
      reasons.push(`Driver is not available (status: ${driver.status})`);
    }
    if (driver.licenseExpiryDate < new Date()) {
      reasons.push('Driver license has expired');
    }
    if (vehicle.status !== 'Available') {
      reasons.push(`Vehicle is not available (status: ${vehicle.status})`);
    }

    if (reasons.length > 0) {
      return res.status(400).json({ eligible: false, reasons });
    }

    return res.status(200).json({
      eligible: true,
      message: 'Driver and vehicle are both eligible for assignment. Proceed to create a trip.',
      driver: { id: driver._id, name: driver.name },
      vehicle: { id: vehicle._id, registrationNumber: vehicle.registrationNumber },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to validate assignment', error: error.message });
  }
};

// @desc   Update a driver
// @route  PUT /api/drivers/:id
// @access Private (Safety Officer / Fleet Manager)
exports.updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    delete updates.licenseNumber; // license number shouldn't change once set

    const validStatuses = ['Available', 'On Trip', 'Off Duty', 'Suspended'];
    if (updates.status && !validStatuses.includes(updates.status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const driver = await Driver.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    return res.status(200).json({ message: 'Driver updated successfully', driver });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update driver', error: error.message });
  }
};

// @desc   Delete a driver
// @route  DELETE /api/drivers/:id
// @access Private (Safety Officer / Fleet Manager)
exports.deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const activeTrip = await Trip.findOne({ driver: id, status: 'Dispatched' });
    if (activeTrip) {
      return res.status(400).json({ message: 'Cannot delete a driver who is currently on a dispatched trip' });
    }

    const driver = await Driver.findByIdAndDelete(id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    return res.status(200).json({ message: 'Driver deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete driver', error: error.message });
  }
};

// @desc   Get all drivers, with optional filters
// @route  GET /api/drivers?status=&search=
// @access Private
exports.getAllDrivers = async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const drivers = await Driver.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ count: drivers.length, drivers });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch drivers', error: error.message });
  }
};