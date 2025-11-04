const express = require('express');
const RecurringTransaction = require('../models/RecurringTransaction');
const authMiddleware = require('../middleware/auth');
const { calculateNextDate } = require('../utils/scheduler');

const router = express.Router();
router.use(authMiddleware);

// Get all recurring transactions
router.get('/', async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const query = { user: req.userId };
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const recurring = await RecurringTransaction.find(query)
      .sort({ nextDate: 1 });
    
    res.json(recurring);
  } catch (error) {
    console.error('Get recurring transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single recurring transaction
router.get('/:id', async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!recurring) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    res.json(recurring);
  } catch (error) {
    console.error('Get recurring transaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create recurring transaction
router.post('/', async (req, res) => {
  try {
    const { name, type, amount, category, description, frequency, startDate, endDate, tags } = req.body;

    // Validation
    if (!name || !type || !amount || !category || !frequency || !startDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be income or expense' });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(frequency)) {
      return res.status(400).json({ message: 'Invalid frequency' });
    }

    const start = new Date(startDate);
    const recurring = new RecurringTransaction({
      user: req.userId,
      name,
      type,
      amount,
      category,
      description,
      frequency,
      startDate: start,
      nextDate: start,
      endDate: endDate ? new Date(endDate) : null,
      tags: tags || []
    });

    await recurring.save();
    res.status(201).json(recurring);
  } catch (error) {
    console.error('Create recurring transaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update recurring transaction
router.put('/:id', async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!recurring) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    const { name, amount, category, description, frequency, isActive, endDate, tags } = req.body;

    if (name) recurring.name = name;
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ message: 'Amount must be greater than 0' });
      }
      recurring.amount = amount;
    }
    if (category) recurring.category = category;
    if (description !== undefined) recurring.description = description;
    if (frequency) {
      recurring.frequency = frequency;
      // Recalculate next date if frequency changed
      recurring.nextDate = calculateNextDate(recurring.nextDate, frequency);
    }
    if (isActive !== undefined) recurring.isActive = isActive;
    if (endDate !== undefined) recurring.endDate = endDate ? new Date(endDate) : null;
    if (tags) recurring.tags = tags;

    await recurring.save();
    res.json(recurring);
  } catch (error) {
    console.error('Update recurring transaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete recurring transaction
router.delete('/:id', async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!recurring) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    res.json({ message: 'Recurring transaction deleted successfully' });
  } catch (error) {
    console.error('Delete recurring transaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle active status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const recurring = await RecurringTransaction.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!recurring) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }

    recurring.isActive = !recurring.isActive;
    await recurring.save();

    res.json(recurring);
  } catch (error) {
    console.error('Toggle recurring transaction error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get upcoming recurring transactions
router.get('/upcoming/list', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const upcoming = await RecurringTransaction.find({
      user: req.userId,
      isActive: true,
      nextDate: { $lte: futureDate }
    }).sort({ nextDate: 1 });

    res.json(upcoming);
  } catch (error) {
    console.error('Get upcoming recurring transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;