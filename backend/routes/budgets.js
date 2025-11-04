const express = require('express');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();
router.use(authMiddleware);

// Get all budgets with spent amounts
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId, isActive: true });

    // Calculate spent amount for each budget
    const budgetsWithSpent = await Promise.all(budgets.map(async (budget) => {
      const startDate = new Date(budget.startDate);
      const endDate = budget.endDate || new Date();

      const spent = await Transaction.aggregate([
        {
          $match: {
            user: mongoose.Types.ObjectId(req.userId),
            type: 'expense',
            category: budget.category,
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      return {
        ...budget.toObject(),
        spent: spent[0]?.total || 0,
        percentage: spent[0]?.total ? (spent[0].total / budget.limit) * 100 : 0
      };
    }));

    res.json(budgetsWithSpent);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single budget
router.get('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Calculate spent amount
    const spent = await Transaction.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(req.userId),
          type: 'expense',
          category: budget.category,
          date: { 
            $gte: new Date(budget.startDate), 
            $lte: budget.endDate || new Date() 
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const budgetWithSpent = {
      ...budget.toObject(),
      spent: spent[0]?.total || 0,
      percentage: spent[0]?.total ? (spent[0].total / budget.limit) * 100 : 0
    };

    res.json(budgetWithSpent);
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create budget
router.post('/', async (req, res) => {
  try {
    const { category, limit, period, alertThreshold, startDate, endDate } = req.body;

    if (!category || !limit) {
      return res.status(400).json({ message: 'Category and limit are required' });
    }

    if (limit <= 0) {
      return res.status(400).json({ message: 'Limit must be greater than 0' });
    }

    // Check if budget already exists for this category
    const existing = await Budget.findOne({
      user: req.userId,
      category,
      isActive: true
    });

    if (existing) {
      return res.status(400).json({ message: 'Budget already exists for this category' });
    }

    const budget = new Budget({
      user: req.userId,
      category,
      limit,
      period: period || 'monthly',
      alertThreshold: alertThreshold || 80,
      startDate: startDate || Date.now(),
      endDate: endDate || null
    });

    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update budget
router.put('/:id', async (req, res) => {
  try {
    const { limit, alertThreshold, isActive, period } = req.body;

    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    if (limit !== undefined) {
      if (limit <= 0) {
        return res.status(400).json({ message: 'Limit must be greater than 0' });
      }
      budget.limit = limit;
    }
    if (alertThreshold !== undefined) budget.alertThreshold = alertThreshold;
    if (isActive !== undefined) budget.isActive = isActive;
    if (period !== undefined) budget.period = period;

    await budget.save();
    res.json(budget);
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete budget
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check budget alerts
router.get('/alerts/check', async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId, isActive: true });
    const alerts = [];

    for (const budget of budgets) {
      const spent = await Transaction.aggregate([
        {
          $match: {
            user: mongoose.Types.ObjectId(req.userId),
            type: 'expense',
            category: budget.category,
            date: { 
              $gte: new Date(budget.startDate), 
              $lte: budget.endDate || new Date() 
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      const spentAmount = spent[0]?.total || 0;
      const percentage = (spentAmount / budget.limit) * 100;

      if (percentage >= budget.alertThreshold) {
        alerts.push({
          budget: budget.category,
          spent: spentAmount,
          limit: budget.limit,
          percentage: percentage.toFixed(2),
          message: percentage >= 100 
            ? `You've exceeded your ${budget.category} budget!` 
            : `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget`
        });
      }
    }

    res.json({ alerts, count: alerts.length });
  } catch (error) {
    console.error('Check alerts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;