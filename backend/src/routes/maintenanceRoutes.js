const express = require('express');
const router = express.Router();

const maintenanceController = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All maintenance routes require an authenticated user
router.use(protect);

// @route   POST /api/maintenance
// @desc    Schedule a new maintenance record (auto-sets vehicle status to "In Shop")
// @access  Private (Fleet Manager)
router.post('/', authorize('Fleet Manager'), maintenanceController.scheduleMaintenance);

// @route   GET /api/maintenance
// @desc    Get maintenance history (supports ?vehicle=&status= filters)
// @access  Private
router.get('/', maintenanceController.getMaintenanceHistory);

// @route   GET /api/maintenance/:id
// @desc    Get a single maintenance record by id
// @access  Private
router.get('/:id', maintenanceController.getMaintenanceById);

// @route   PUT /api/maintenance/:id
// @desc    Update a maintenance record's details
// @access  Private (Fleet Manager)
router.put('/:id', authorize('Fleet Manager'), maintenanceController.updateMaintenance);

// @route   DELETE /api/maintenance/:id
// @desc    Delete a maintenance record
// @access  Private (Fleet Manager)
router.delete('/:id', authorize('Fleet Manager'), maintenanceController.deleteMaintenance);

// @route   PUT /api/maintenance/:id/status
// @desc    Update maintenance status (e.g. close it, restoring vehicle to "Available")
// @access  Private (Fleet Manager)
router.put('/:id/status', authorize('Fleet Manager'), maintenanceController.updateMaintenanceStatus);

module.exports = router;