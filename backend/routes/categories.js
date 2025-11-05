const express = require('express');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// ✅ Get categories (default + user-owned) with correct deduping
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;

    const match = {
      $or: [
        { isDefault: true },
        { user: new mongoose.Types.ObjectId(req.userId) }
      ]
    };

    if (type) match.type = type;

    let categories = await Category.find(match).sort({ name: 1 }).lean();

    // ✅ Deduplicate by (name + type) pair, while preferring user's copy
    const map = new Map();
    for (const c of categories) {
      const key = `${c.name.toLowerCase()}::${c.type.toLowerCase()}`;

      const existing = map.get(key);
      const isUserOwned = c.user && String(c.user) === String(req.userId);

      if (!existing) {
        map.set(key, c);
      } else {
        const existingIsUserOwned = existing.user && String(existing.user) === String(req.userId);
        // Prefer user's version over default
        if (isUserOwned && !existingIsUserOwned) {
          map.set(key, c);
        }
      }
    }

    res.json([...map.values()]);
  } catch (error) {
    console.error('GET categories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      $or: [
        { user: req.userId },
        { isDefault: true }
      ]
    });

    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    console.error('GET category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Create category
router.post('/', async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }

    const exists = await Category.findOne({
      user: req.userId,
      name: name.trim(),
      type
    });

    if (exists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      user: req.userId,
      name: name.trim(),
      type,
      icon: icon || '📁',
      color: color || '#6366f1',
      isDefault: false
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('CREATE category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Update category
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
    console.error('UPDATE category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Delete category only if unused
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const used = await Transaction.countDocuments({
      user: req.userId,
      category: category.name
    });

    if (used > 0) {
      return res.status(400).json({
        message: `Cannot delete. Used in ${used} transactions.`,
        used
      });
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted successfully' });

  } catch (error) {
    console.error('DELETE category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
