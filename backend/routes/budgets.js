const express = require('express');
const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Get all budgets
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(budgets);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new budget
router.post('/', async (req, res) => {
  try {
    const { category, limitAmount, period } = req.body;

    if (!category || !limitAmount || !period) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const budget = new Budget({
      user: req.userId,
      category,
      limitAmount,
      period
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
    const { category, limitAmount, period } = req.body;

    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    budget.category = category || budget.category;
    budget.limitAmount = limitAmount || budget.limitAmount;
    budget.period = period || budget.period;

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
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Budget Alerts (Fixes /api/budgets/alerts/check 404)
router.get('/alerts/check', async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId });
    if (!budgets || budgets.length === 0) {
      return res.json([]);
    }

    const alerts = [];

    for (const budget of budgets) {
      const spending = await Transaction.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(req.userId),
            category: budget.category,
            type: 'expense'
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const totalSpent = spending.length > 0 ? spending[0].total : 0;

      if (totalSpent >= budget.limitAmount) {
        alerts.push({
          category: budget.category,
          spent: totalSpent,
          limit: budget.limitAmount
        });
      }
    }

    res.json(alerts);

  } catch (error) {
    console.error('Check alerts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
