const express = require('express');
const router = express.Router();

const vehicleController = require('../controllers/vehicleController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All vehicle routes require an authenticated user
router.use(protect);

// @route   POST /api/vehicles
// @desc    Add a new vehicle to the registry
// @access  Private (Fleet Manager)
router.post('/', authorize('Fleet Manager'), vehicleController.addVehicle);

// @route   GET /api/vehicles
// @desc    Get all vehicles (supports ?type=&status=&search= filters)
// @access  Private
router.get('/', vehicleController.getAllVehicles);

// @route   GET /api/vehicles/:id
// @desc    Get a single vehicle by id
// @access  Private
router.get('/:id', vehicleController.getVehicleById);

// @route   PUT /api/vehicles/:id
// @desc    Update a vehicle's details or status
// @access  Private (Fleet Manager)
router.put('/:id', authorize('Fleet Manager'), vehicleController.updateVehicle);

// @route   DELETE /api/vehicles/:id
// @desc    Delete a vehicle from the registry
// @access  Private (Fleet Manager)
router.delete('/:id', authorize('Fleet Manager'), vehicleController.deleteVehicle);

module.exports = router;