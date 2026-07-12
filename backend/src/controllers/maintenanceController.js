import Maintenance from '../models/Maintenance.js';
import Vehicle from '../models/Vehicle.js';

// @desc   Schedule (create) a maintenance record for a vehicle
// @route  POST /api/maintenance
// @access Private (Fleet Manager)
export const scheduleMaintenance = async (req, res) => {
  try {
    const { vehicle, maintenanceType, date, cost, notes } = req.body;

    if (!vehicle || !maintenanceType || cost == null) {
      return res.status(400).json({
        message: 'vehicle, maintenanceType, and cost are required',
      });
    }

    const vehicleDoc = await Vehicle.findById(vehicle);

    if (!vehicleDoc) {
      return res.status(404).json({
        message: 'Vehicle not found',
      });
    }

    if (vehicleDoc.status === 'On Trip') {
      return res.status(400).json({
        message: 'Cannot schedule maintenance while the vehicle is on an active trip',
      });
    }

    const maintenance = await Maintenance.create({
      vehicle,
      maintenanceType,
      date,
      cost,
      notes,
      status: 'Open',
    });

    return res.status(201).json({
      message: 'Maintenance scheduled successfully. Vehicle status set to "In Shop".',
      maintenance,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to schedule maintenance',
      error: error.message,
    });
  }
};

// @desc   Update a maintenance record's status
// @route  PUT /api/maintenance/:id/status
// @access Private (Fleet Manager)
export const updateMaintenanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Open', 'Closed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const maintenance = await Maintenance.findById(id);

    if (!maintenance) {
      return res.status(404).json({
        message: 'Maintenance record not found',
      });
    }

    if (status === 'Closed') {
      await maintenance.close();
    } else {
      maintenance.status = status;
      await maintenance.save();
    }

    return res.status(200).json({
      message: 'Maintenance status updated successfully',
      maintenance,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update maintenance status',
      error: error.message,
    });
  }
};

// @desc   View maintenance history
// @route  GET /api/maintenance
// @access Private
export const getMaintenanceHistory = async (req, res) => {
  try {
    const { vehicle, status } = req.query;

    const filter = {};

    if (vehicle) filter.vehicle = vehicle;
    if (status) filter.status = status;

    const history = await Maintenance.find(filter)
      .populate('vehicle', 'registrationNumber name')
      .sort({ date: -1 });

    const totalCost = history.reduce(
      (sum, record) => sum + record.cost,
      0
    );

    return res.status(200).json({
      count: history.length,
      totalCost,
      history,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch maintenance history',
      error: error.message,
    });
  }
};