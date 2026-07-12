import express from "express";
import dashboardController from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All dashboard routes require an authenticated user
router.use(protect);

/**
 * @route   GET /api/dashboard
 * @desc    Get fleet KPIs (vehicle/trip/driver counts, fleet utilization,
 *          fuel usage, expenses, and upcoming maintenance)
 *          Supports ?type=&status=&region= filters
 * @access  Private
 */
router.get("/", dashboardController.getDashboardStats);

export default router;