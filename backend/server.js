const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const { processRecurringTransactions } = require('./utils/scheduler');

// Route imports
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const dashboardRoutes = require('./routes/dashboard');
const budgetRoutes = require('./routes/budgets');
const recurringRoutes = require('./routes/recurring');
const analyticsRoutes = require('./routes/analytics'); // ✅ NEW

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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/analytics', analyticsRoutes); // ✅ REGISTERED

// Scheduled Recurring Task (runs daily at midnight)
cron.schedule('0 0 * * *', () => {
  console.log('🔄 Running scheduled recurring transactions...');
  processRecurringTransactions();
});

// Run once on server startup in development only
if (process.env.NODE_ENV === 'development') {
  console.log('🔄 Running initial recurring check on startup...');
  processRecurringTransactions();
}

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
});
