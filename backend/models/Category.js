const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
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
  icon: {
    type: String,
    default: '📁'
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

CategorySchema.index({ user: 1, type: 1 });
CategorySchema.index({ user: 1, name: 1 });

module.exports = mongoose.model('Category', CategorySchema);