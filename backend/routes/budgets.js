const express = require('express');
const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// ✅ ALERTS FIRST
router.get('/alerts/check', async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId });
    const alerts = [];

    for (const b of budgets) {
      const agg = await Transaction.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(req.userId),
            category: b.category,
            type: 'expense',
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const spent = agg.length ? agg[0].total : 0;
      if (spent >= b.limit) {
        alerts.push({
          category: b.category,
          spent,
          limit: b.limit,
          message: 'Budget limit reached',
        });
      }
    }

    res.json(alerts);
  } catch (error) {
    console.error('Check alerts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ GET all budgets
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.userId }).lean();

    const results = await Promise.all(
      budgets.map(async (b) => {
        const spentAgg = await Transaction.aggregate([
          {
            $match: {
              user: new mongoose.Types.ObjectId(req.userId),
              category: b.category,
              type: 'expense',
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const spent = spentAgg.length ? spentAgg[0].total : 0;
        const percent = b.limit > 0 ? (spent / b.limit) * 100 : 0;

        return { ...b, spent, percent };
      })
    );

    res.json(results);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ CREATE
router.post('/', async (req, res) => {
  try {
    const { category, limit, period } = req.body;

    if (!category || !limit) {
      return res.status(400).json({ message: 'Category and limit are required' });
    }

    const budget = new Budget({
      user: req.userId,
      category,
      limit,
      period
    });

    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ DELETE
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.userId });

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

module.exports = router;
