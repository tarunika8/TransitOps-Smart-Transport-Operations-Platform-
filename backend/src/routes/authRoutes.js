import express from "express";
import authController from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Register
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

// Get Profile
router.get("/profile", protect, authController.getProfile);

// Change Password
router.put("/change-password", protect, authController.changePassword);

export default router;