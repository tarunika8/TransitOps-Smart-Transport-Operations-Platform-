import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import Vehicle from '../models/Vehicle.js';
import Maintenance from '../models/Maintenance.js';
import FuelLog from '../models/FuelLog.js';

// @desc   Add an expense (toll, fine, parking, etc.)
// @route  POST /api/expenses
// @access Private (Financial Analyst / Fleet Manager)
export const addExpense = async (req, res) => {
  try {
    const { vehicle, expenseType, amount, date, description } = req.body;

    if (!vehicle || !expenseType || amount == null) {
      return res.status(400).json({
        message: 'vehicle, expenseType, and amount are required',
      });
    }

    const vehicleDoc = await Vehicle.findById(vehicle);

    if (!vehicleDoc) {
      return res.status(404).json({
        message: 'Vehicle not found',
      });
    }

    const expense = await Expense.create({
      vehicle,
      expenseType,
      amount,
      date,
      description,
    });

    return res.status(201).json({
      message: 'Expense added successfully',
      expense,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to add expense',
      error: error.message,
    });
  }
};

// @desc   Get expenses grouped by month
// @route  GET /api/expenses/monthly
// @access Private (Financial Analyst)
export const getMonthlyExpenses = async (req, res) => {
  try {
    const year =
      parseInt(req.query.year, 10) || new Date().getFullYear();

    const { vehicle } = req.query;

    const start = new Date(`${year}-01-01T00:00:00.000Z`);
    const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    const match = {
      date: {
        $gte: start,
        $lt: end,
      },
    };

    if (vehicle) {
      match.vehicle = new mongoose.Types.ObjectId(vehicle);
    }

    const monthly = await Expense.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: {
            month: {
              $month: '$date',
            },
          },
          totalAmount: {
            $sum: '$amount',
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          '_id.month': 1,
        },
      },
    ]);

    const result = Array.from({ length: 12 }, (_, i) => {
      const found = monthly.find(
        (m) => m._id.month === i + 1
      );

      return {
        month: i + 1,
        totalAmount: found ? found.totalAmount : 0,
        count: found ? found.count : 0,
      };
    });

    return res.status(200).json({
      year,
      monthly: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch monthly expenses',
      error: error.message,
    });
  }
};

// @desc   Full expense report per vehicle
// @route  GET /api/expenses/report
// @access Private (Financial Analyst)
export const getExpenseReport = async (req, res) => {
  try {
    const { vehicle } = req.query;

    const vehicleFilter = vehicle ? { _id: vehicle } : {};

    const vehicles = await Vehicle.find(vehicleFilter);

    const report = await Promise.all(
      vehicles.map(async (v) => {
        const [fuelLogs, maintenanceLogs, expenses] =
          await Promise.all([
            FuelLog.find({ vehicle: v._id }),
            Maintenance.find({ vehicle: v._id }),
            Expense.find({ vehicle: v._id }),
          ]);

        const fuelCost = fuelLogs.reduce(
          (sum, log) => sum + log.cost,
          0
        );

        const maintenanceCost = maintenanceLogs.reduce(
          (sum, maintenance) => sum + maintenance.cost,
          0
        );

        const otherExpenses = expenses.reduce(
          (sum, expense) => sum + expense.amount,
          0
        );

        const totalOperationalCost =
          fuelCost + maintenanceCost + otherExpenses;

        return {
          vehicleId: v._id,
          registrationNumber: v.registrationNumber,
          fuelCost,
          maintenanceCost,
          otherExpenses,
          totalOperationalCost,
        };
      })
    );

    return res.status(200).json({
      count: report.length,
      report,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to generate expense report',
      error: error.message,
    });
  }
};

// @desc   Get all expenses
// @route  GET /api/expenses
// @access Private
export const getAllExpenses = async (req, res) => {
  try {
    const { vehicle, expenseType } = req.query;

    const filter = {};

    if (vehicle) filter.vehicle = vehicle;
    if (expenseType) filter.expenseType = expenseType;

    const expenses = await Expense.find(filter)
      .populate('vehicle', 'registrationNumber name')
      .sort({ date: -1 });

    return res.status(200).json({
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch expenses',
      error: error.message,
    });
  }
};