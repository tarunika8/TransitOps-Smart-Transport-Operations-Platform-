const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Vehicle = require('../models/Vehicle');
const AppError = require('../utils/AppError');

/**
 * Add a new expense record (toll, fine, parking, etc.) for a vehicle.
 */
const addExpense = async ({ vehicle, expenseType, amount, date, description }) => {
  if (!vehicle || !expenseType || amount == null) {
    throw new AppError('vehicle, expenseType, and amount are required', 400);
  }
  if (amount < 0) {
    throw new AppError('amount cannot be negative', 400);
  }

  const vehicleDoc = await Vehicle.findById(vehicle);
  if (!vehicleDoc) {
    throw new AppError('Vehicle not found', 404);
  }

  return Expense.create({ vehicle, expenseType, amount, date, description });
};

/**
 * Update an existing expense record.
 * Vehicle reference cannot be changed once set, to keep cost history accurate.
 */
const updateExpense = async (expenseId, updates = {}) => {
  const safeUpdates = { ...updates };
  delete safeUpdates.vehicle;

  if (safeUpdates.amount != null && safeUpdates.amount < 0) {
    throw new AppError('amount cannot be negative', 400);
  }

  const expense = await Expense.findByIdAndUpdate(expenseId, safeUpdates, {
    new: true,
    runValidators: true,
  });

  if (!expense) {
    throw new AppError('Expense not found', 404);
  }

  return expense;
};

/**
 * Delete an expense record by id.
 */
const deleteExpense = async (expenseId) => {
  const expense = await Expense.findByIdAndDelete(expenseId);
  if (!expense) {
    throw new AppError('Expense not found', 404);
  }
  return { message: 'Expense deleted successfully' };
};

/**
 * Get a month-by-month expense summary for a given year (defaults to current year).
 * Always returns all 12 months, filling in zero totals where there were no expenses,
 * so the result can be charted directly.
 */
const getMonthlyExpenseSummary = async ({ year, vehicle } = {}) => {
  const targetYear = year || new Date().getFullYear();
  const start = new Date(`${targetYear}-01-01T00:00:00.000Z`);
  const end = new Date(`${targetYear + 1}-01-01T00:00:00.000Z`);

  const match = { date: { $gte: start, $lt: end } };
  if (vehicle) match.vehicle = new mongoose.Types.ObjectId(vehicle);

  const monthly = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: { month: { $month: '$date' } },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.month': 1 } },
  ]);

  const result = Array.from({ length: 12 }, (_, i) => {
    const found = monthly.find((m) => m._id.month === i + 1);
    return {
      month: i + 1,
      totalAmount: found ? found.totalAmount : 0,
      count: found ? found.count : 0,
    };
  });

  return { year: targetYear, monthly: result };
};

/**
 * Get total expenses grouped by expense type/category (e.g. Toll, Fine, Parking),
 * optionally scoped to a single vehicle.
 */
const getExpenseByCategory = async ({ vehicle } = {}) => {
  const match = {};
  if (vehicle) match.vehicle = new mongoose.Types.ObjectId(vehicle);

  const byCategory = await Expense.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$expenseType',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $project: { _id: 0, expenseType: '$_id', totalAmount: 1, count: 1 } },
    { $sort: { totalAmount: -1 } },
  ]);

  return byCategory;
};

module.exports = {
  addExpense,
  updateExpense,
  deleteExpense,
  getMonthlyExpenseSummary,
  getExpenseByCategory,
};