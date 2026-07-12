const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

// All dashboard routes require an authenticated user
router.use(protect);

// @route   GET /api/dashboard
// @desc    Get fleet KPIs (vehicle/trip/driver counts, fleet utilization,
//          fuel usage, expenses, and upcoming maintenance)
//          Supports ?type=&status=&region= filters
// @access  Private
router.get('/', dashboardController.getDashboardStats);

module.exports = router;