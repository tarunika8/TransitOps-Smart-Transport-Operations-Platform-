const express = require('express');
const router = express.Router();

const fuelController = require('../controllers/fuelController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All fuel routes require an authenticated user
router.use(protect);

// @route   POST /api/fuel
// @desc    Add a new fuel log entry for a vehicle
// @access  Private (Driver, Fleet Manager)
router.post('/', authorize('Driver', 'Fleet Manager'), fuelController.addFuelLog);

// @route   GET /api/fuel
// @desc    Get fuel log history (supports ?vehicle=&from=&to= filters)
// @access  Private
router.get('/', fuelController.getFuelHistory);

// @route   GET /api/fuel/:id
// @desc    Get a single fuel log entry by id
// @access  Private
router.get('/:id', fuelController.getFuelLogById);

// @route   PUT /api/fuel/:id
// @desc    Update a fuel log entry
// @access  Private (Fleet Manager)
router.put('/:id', authorize('Fleet Manager'), fuelController.updateFuelLog);

// @route   DELETE /api/fuel/:id
// @desc    Delete a fuel log entry
// @access  Private (Fleet Manager)
router.delete('/:id', authorize('Fleet Manager'), fuelController.deleteFuelLog);

// @route   GET /api/fuel/:vehicleId/mileage
// @desc    Calculate fuel efficiency / mileage for a specific vehicle
// @access  Private (Fleet Manager, Financial Analyst)
router.get(
  '/:vehicleId/mileage',
  authorize('Fleet Manager', 'Financial Analyst'),
  fuelController.calculateMileage
);

module.exports = router;