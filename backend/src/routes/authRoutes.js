const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new user (Fleet Manager, Driver, Safety Officer, Financial Analyst)
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login a user and receive a JWT
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/profile
// @desc    Get the currently authenticated user's profile
// @access  Private
router.get('/profile', protect, authController.getProfile);

// @route   PUT /api/auth/change-password
// @desc    Change the currently authenticated user's password
// @access  Private
router.put('/change-password', protect, authController.changePassword);

module.exports = router;