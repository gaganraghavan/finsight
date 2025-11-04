const express = require('express');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

// Get dashboard summary
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { user: req.userId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query);

    const summary = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'income') acc.totalIncome += transaction.amount;
      else acc.totalExpenses += transaction.amount;
      return acc;
    }, { totalIncome: 0, totalExpenses: 0 });

    summary.balance = summary.totalIncome - summary.totalExpenses;
    summary.transactionCount = transactions.length;

    res.json(summary);
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get category breakdown
router.get('/category-breakdown', async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    const matchQuery = { user: req.userId };
    if (type) matchQuery.type = type;
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const breakdown = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json(breakdown.map(b => ({
      category: b._id,
      amount: b.total,
      count: b.count
    })));
  } catch (error) {
    console.error('Get category breakdown error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get monthly trends
router.get('/monthly-trends', async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const trends = await Transaction.aggregate([
      { $match: { user: req.userId, date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const formatted = {};
    trends.forEach(item => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
      if (!formatted[key]) formatted[key] = { month: key, income: 0, expense: 0 };
      formatted[key][item._id.type] = item.total;
    });

    res.json(Object.values(formatted));
  } catch (error) {
    console.error('Get monthly trends error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recent transactions
router.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const transactions = await Transaction.find({ user: req.userId })
      .sort({ date: -1 })
      .limit(parseInt(limit));
    res.json(transactions);
  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
