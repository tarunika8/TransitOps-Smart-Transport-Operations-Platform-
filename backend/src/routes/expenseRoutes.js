import express from "express";
import expenseController from "../controllers/expenseController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// All expense routes require an authenticated user
router.use(protect);

// @route   POST /api/expenses
// @desc    Add a new expense (toll, fine, parking, etc.)
// @access  Private (Financial Analyst, Fleet Manager)
router.post(
  "/",
  authorize("Financial Analyst", "Fleet Manager"),
  expenseController.addExpense
);

// @route   GET /api/expenses
// @desc    Get all expenses (supports ?vehicle=&expenseType= filters)
// @access  Private
router.get("/", expenseController.getAllExpenses);

// @route   GET /api/expenses/monthly
// @desc    Get expenses grouped by month for a given year (supports ?year=&vehicle=)
// @access  Private (Financial Analyst)
router.get(
  "/monthly",
  authorize("Financial Analyst"),
  expenseController.getMonthlyExpenses
);

// @route   GET /api/expenses/report
// @desc    Get a full operational cost report per vehicle (fuel + maintenance + expenses)
// @access  Private (Financial Analyst)
router.get(
  "/report",
  authorize("Financial Analyst"),
  expenseController.getExpenseReport
);

// @route   GET /api/expenses/:id
// @desc    Get a single expense by id
// @access  Private
router.get("/:id", expenseController.getExpenseById);

// @route   PUT /api/expenses/:id
// @desc    Update an expense
// @access  Private (Financial Analyst, Fleet Manager)
router.put(
  "/:id",
  authorize("Financial Analyst", "Fleet Manager"),
  expenseController.updateExpense
);

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
// @access  Private (Financial Analyst, Fleet Manager)
router.delete(
  "/:id",
  authorize("Financial Analyst", "Fleet Manager"),
  expenseController.deleteExpense
);

export default router;