const express = require('express');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// ✅ Get all categories (default + user, no duplicates)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;

    const matchQuery = {
      $or: [
        { isDefault: true },       // default global categories
        { user: req.userId }       // user-created categories
      ]
    };

    if (type) matchQuery.type = type;

    let categories = await Category.find(matchQuery).sort({ name: 1 });

    // ✅ Remove duplicates by name (prefer user's version if exists)
    const unique = {};
    categories.forEach(cat => {
      unique[cat.name.toLowerCase()] = cat;
    });

    categories = Object.values(unique);

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      $or: [
        { user: req.userId },
        { isDefault: true }
      ]
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create category
router.post('/', async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Please provide name and type' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either income or expense' });
    }

    // ✅ Prevent duplicate
    const existingCategory = await Category.findOne({
      user: req.userId,
      name: name.trim(),
      type
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({
      user: req.userId,
      name: name.trim(),
      type,
      icon: icon || '📁',
      color: color || '#6366f1',
      isDefault: false
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { name, icon, color } = req.body;

    const category = await Category.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (name) category.name = name.trim();
    if (icon) category.icon = icon;
    if (color) category.color = color;

    await category.save();
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const transactionCount = await Transaction.countDocuments({
      user: req.userId,
      category: category.name
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. It is used in ${transactionCount} transactions.`,
        transactionCount
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
