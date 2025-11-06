const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/auth');
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const router = express.Router();

// Default categories for new users
const defaultCategories = [
  // Income categories
  { name: 'Salary', type: 'income', icon: '💰', color: '#10b981', isDefault: true },
  { name: 'Freelance', type: 'income', icon: '💼', color: '#3b82f6', isDefault: true },
  { name: 'Business', type: 'income', icon: '🏢', color: '#8b5cf6', isDefault: true },
  { name: 'Investment Returns', type: 'income', icon: '📈', color: '#06b6d4', isDefault: true },
  { name: 'Rental Income', type: 'income', icon: '🏠', color: '#84cc16', isDefault: true },
  { name: 'Side Hustle', type: 'income', icon: '🚀', color: '#14b8a6', isDefault: true },
  { name: 'Gift/Bonus', type: 'income', icon: '🎁', color: '#ec4899', isDefault: true },
  { name: 'Refunds', type: 'income', icon: '↩️', color: '#f59e0b', isDefault: true },
  
  // Expense categories
  { name: 'Food & Dining', type: 'expense', icon: '🍔', color: '#ef4444', isDefault: true },
  { name: 'Transport', type: 'expense', icon: '🚗', color: '#f59e0b', isDefault: true },
  { name: 'Shopping', type: 'expense', icon: '🛍️', color: '#ec4899', isDefault: true },
  { name: 'Bills & Utilities', type: 'expense', icon: '📱', color: '#6366f1', isDefault: true },
  { name: 'Entertainment', type: 'expense', icon: '🎬', color: '#8b5cf6', isDefault: true },
  { name: 'Healthcare', type: 'expense', icon: '🏥', color: '#14b8a6', isDefault: true },
  { name: 'Education', type: 'expense', icon: '📚', color: '#0ea5e9', isDefault: true },
  { name: 'Rent/EMI', type: 'expense', icon: '🏠', color: '#f97316', isDefault: true },
  { name: 'Other', type: 'expense', icon: '💸', color: '#64748b', isDefault: true }
];

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({ name, email, password });
    await user.save();

    // Create default categories for user
    const categories = defaultCategories.map(cat => ({
      ...cat,
      user: user._id
    }));
    await Category.insertMany(categories);

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// ✅ GOOGLE LOGIN
router.post("/google-login", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Credential missing" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, name, email, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
        avatar: picture,
        password: null, // ensures normal login is separate
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(500).json({ message: "Google login failed" });
  }
});


module.exports = router;