import express from "express";
import driverController from "../controllers/driverController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// All driver routes require an authenticated user
router.use(protect);

// @route   POST /api/drivers
// @desc    Add a new driver profile
// @access  Private (Safety Officer, Fleet Manager)
router.post(
  "/",
  authorize("Safety Officer", "Fleet Manager"),
  driverController.addDriver
);

// @route   GET /api/drivers
// @desc    Get all drivers (supports ?status=&search= filters)
// @access  Private
router.get("/", driverController.getAllDrivers);

// @route   GET /api/drivers/:id
// @desc    Get a single driver by id
// @access  Private
router.get("/:id", driverController.getDriverById);

// @route   PUT /api/drivers/:id
// @desc    Update a driver's details or status
// @access  Private (Safety Officer, Fleet Manager)
router.put(
  "/:id",
  authorize("Safety Officer", "Fleet Manager"),
  driverController.updateDriver
);

// @route   DELETE /api/drivers/:id
// @desc    Delete a driver profile
// @access  Private (Safety Officer, Fleet Manager)
router.delete(
  "/:id",
  authorize("Safety Officer", "Fleet Manager"),
  driverController.deleteDriver
);

// @route   POST /api/drivers/:driverId/assign/:vehicleId
// @desc    Check driver + vehicle eligibility ahead of trip assignment
// @access  Private (Driver, Fleet Manager)
router.post(
  "/:driverId/assign/:vehicleId",
  authorize("Driver", "Fleet Manager"),
  driverController.assignDriverToVehicle
);

export default router;