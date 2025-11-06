const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const { processRecurringTransactions, displayActiveRecurring } = require('./utils/scheduler');

// Route imports
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const dashboardRoutes = require('./routes/dashboard');
const budgetRoutes = require('./routes/budgets');
const recurringRoutes = require('./routes/recurring');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finsight', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB Connected');
  
  // Display active recurring transactions on startup
  await displayActiveRecurring();
  
  // Run recurring transactions processor on startup
  console.log('🔄 Running initial recurring transactions check...');
  await processRecurringTransactions();
})
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/analytics', analyticsRoutes);

// Scheduled Recurring Task (runs daily at midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('🔄 Running scheduled recurring transactions (midnight)...');
  await processRecurringTransactions();
  await displayActiveRecurring();
});

// ✅ Additional cron job - runs every hour to catch due transactions
cron.schedule('0 * * * *', async () => {
  console.log('🔄 Running hourly recurring transactions check...');
  await processRecurringTransactions();
});

// ✅ For development: Run every 5 minutes
if (process.env.NODE_ENV === 'development') {
  cron.schedule('*/5 * * * *', async () => {
    console.log('🔄 Running 5-minute recurring transactions check (DEV MODE)...');
    await processRecurringTransactions();
  });
}

// ✅ Manual trigger endpoint for testing
app.post('/api/recurring/process-now', async (req, res) => {
  try {
    const count = await processRecurringTransactions();
    await displayActiveRecurring();
    res.json({ 
      message: 'Recurring transactions processed',
      processed: count 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error processing recurring transactions',
      error: error.message 
    });
  }
});

// ✅ Endpoint to display active recurring transactions
app.get('/api/recurring/display-active', async (req, res) => {
  try {
    await displayActiveRecurring();
    res.json({ message: 'Active recurring transactions logged to console' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health Check Endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'FinSight API v2.0 Running ✅',
    features: ['Auth', 'Transactions', 'Budgets', 'Recurring', 'Analytics', 'Dark Mode'],
    status: 'healthy'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Recurring transactions will be checked:`);
  console.log(`   - Daily at midnight`);
  console.log(`   - Every hour`);
  if (process.env.NODE_ENV === 'development') {
    console.log(`   - Every 5 minutes (DEV MODE)`);
  }
  console.log(`📡 Manual trigger: POST http://localhost:${PORT}/api/recurring/process-now`);
  console.log(`📊 View active recurring: GET http://localhost:${PORT}/api/recurring/display-active\n`);
});