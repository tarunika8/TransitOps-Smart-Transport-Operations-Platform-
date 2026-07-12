import express from "express";
import tripController from "../controllers/tripController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// All trip routes require an authenticated user
router.use(protect);

// @route   POST /api/trips
// @desc    Create a new trip (status = Draft)
// @access  Private (Driver, Fleet Manager)
router.post(
  "/",
  authorize("Driver", "Fleet Manager"),
  tripController.createTrip
);

// @route   GET /api/trips
// @desc    Get all trips (supports ?status=&vehicle=&driver= filters)
// @access  Private
router.get("/", tripController.getAllTrips);

// @route   GET /api/trips/:id
// @desc    Get a single trip by id
// @access  Private
router.get("/:id", tripController.getTripById);

// @route   PUT /api/trips/:id
// @desc    Update trip details (e.g. source, destination, planned distance)
// @access  Private (Driver, Fleet Manager)
router.put(
  "/:id",
  authorize("Driver", "Fleet Manager"),
  tripController.updateTrip
);

// @route   DELETE /api/trips/:id
// @desc    Delete a trip record
// @access  Private (Fleet Manager)
router.delete(
  "/:id",
  authorize("Fleet Manager"),
  tripController.deleteTrip
);

// @route   PUT /api/trips/:id/start
// @desc    Start (dispatch) a trip — sets vehicle & driver status to "On Trip"
// @access  Private (Driver, Fleet Manager)
router.put(
  "/:id/start",
  authorize("Driver", "Fleet Manager"),
  tripController.startTrip
);

// @route   PUT /api/trips/:id/end
// @desc    End (complete) a trip — sets vehicle & driver status back to "Available"
// @access  Private (Driver, Fleet Manager)
router.put(
  "/:id/end",
  authorize("Driver", "Fleet Manager"),
  tripController.endTrip
);

// @route   PUT /api/trips/:id/cancel
// @desc    Cancel a Draft or Dispatched trip
// @access  Private (Driver, Fleet Manager)
router.put(
  "/:id/cancel",
  authorize("Driver", "Fleet Manager"),
  tripController.cancelTrip
);

// @route   GET /api/trips/:id/metrics
// @desc    Calculate distance travelled and estimated cost for a trip
// @access  Private (Fleet Manager, Financial Analyst)
router.get(
  "/:id/metrics",
  authorize("Fleet Manager", "Financial Analyst"),
  tripController.calculateDistanceAndCost
);

export default router;