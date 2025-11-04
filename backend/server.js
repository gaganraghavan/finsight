const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const { processRecurringTransactions } = require('./utils/scheduler');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finsight', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/recurring', require('./routes/recurring'));

// Scheduled task for recurring transactions (runs daily at midnight)
cron.schedule('0 0 * * *', () => {
  console.log('🔄 Running scheduled recurring transactions...');
  processRecurringTransactions();
});

// Also run on server start for testing
if (process.env.NODE_ENV === 'development') {
  console.log('🔄 Running initial recurring transactions check...');
  processRecurringTransactions();
}

// Health Check
app.get('/', (req, res) => {
  res.json({ 
    message: 'FinSight API v2.0 Running',
    features: ['Auth', 'Transactions', 'Budgets', 'Recurring', 'Analytics', 'Dark Mode'],
    status: 'healthy'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});