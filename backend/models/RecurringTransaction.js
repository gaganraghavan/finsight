const mongoose = require('mongoose');

const RecurringTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  nextDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  lastProcessed: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

RecurringTransactionSchema.index({ user: 1, nextDate: 1 });
RecurringTransactionSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('RecurringTransaction', RecurringTransactionSchema);