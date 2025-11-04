const express = require('express');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all transactions with filtering
router.get('/', async (req, res) => {
  try {
    const { type, category, startDate, endDate, search } = req.query;
    
    const query = { user: req.userId };

    // Apply filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(1000);

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single transaction
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create transaction
router.post('/', async (req, res) => {
  try {
    const { type, amount, category, description, date, tags, isRecurring, recurringFrequency } = req.body;

    // Validation
    if (!type || !amount || !category) {
      return res.status(400).json({ 
        message: 'Please provide type, amount, and category' 
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ 
        message: 'Type must be either income or expense' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        message: 'Amount must be greater than 0' 
      });
    }

    if (isRecurring && !recurringFrequency) {
      return res.status(400).json({ 
        message: 'Recurring frequency is required for recurring transactions' 
      });
    }

    const transaction = new Transaction({
      user: req.userId,
      type,
      amount,
      category,
      description,
      date: date || Date.now(),
      tags: tags || [],
      isRecurring: isRecurring || false,
      recurringFrequency: isRecurring ? recurringFrequency : undefined
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update transaction
router.put('/:id', async (req, res) => {
  try {
    const { type, amount, category, description, date, tags, isRecurring, recurringFrequency } = req.body;

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Validation
    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ 
        message: 'Type must be either income or expense' 
      });
    }

    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ 
        message: 'Amount must be greater than 0' 
      });
    }

    // Update fields
    if (type) transaction.type = type;
    if (amount) transaction.amount = amount;
    if (category) transaction.category = category;
    if (description !== undefined) transaction.description = description;
    if (date) transaction.date = date;
    if (tags) transaction.tags = tags;
    if (isRecurring !== undefined) transaction.isRecurring = isRecurring;
    if (recurringFrequency) transaction.recurringFrequency = recurringFrequency;

    await transaction.save();
    res.json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bulk delete transactions
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please provide transaction IDs' });
    }

    const result = await Transaction.deleteMany({
      _id: { $in: ids },
      user: req.userId
    });

    res.json({ 
      message: 'Transactions deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;