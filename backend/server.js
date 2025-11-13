const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const path = require("path");

dotenv.config();

const {
  processRecurringTransactions,
  displayActiveRecurring
} = require('./utils/scheduler');

// ✅ Route imports
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const dashboardRoutes = require('./routes/dashboard');
const budgetRoutes = require('./routes/budgets');
const recurringRoutes = require('./routes/recurring');
const analyticsRoutes = require('./routes/analytics');
const uploadRoutes = require("./routes/upload");

const app = express();

// ✅ Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ✅ STATIC FOLDER FOR PROFILE IMAGES (VERY IMPORTANT)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use("/api/export", require("./routes/export"));

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finsight', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB Connected');

  // Run scheduler once at startup
  await displayActiveRecurring();
  await processRecurringTransactions();
})
.catch(err => console.error('❌ MongoDB Error:', err));


// ✅ Scheduled Jobs
cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Midnight Recurring Job Running...');
  await processRecurringTransactions();
  await displayActiveRecurring();
});

cron.schedule('0 * * * *', async () => {
  console.log('⏳ Hourly Recurring Job Running...');
  await processRecurringTransactions();
});

// DEV Mode (every 5 mins)
if (process.env.NODE_ENV === 'development') {
  cron.schedule('*/5 * * * *', async () => {
    console.log('🛠 DEV MODE: Recurring check every 5 mins');
    await processRecurringTransactions();
  });
}


// ✅ Manual trigger endpoints
app.post('/api/recurring/process-now', async (req, res) => {
  try {
    const count = await processRecurringTransactions();
    res.json({ message: "Manually processed recurring transactions", count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/recurring/display-active', async (req, res) => {
  try {
    await displayActiveRecurring();
    res.json({ message: "Displayed active recurring transactions in terminal" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Health endpoint
app.get('/', (req, res) => {
  res.json({
    message: "FinSight API v2.0 Running ✅",
    status: "healthy"
  });
});


// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ message: "Server error", error: err.message });
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Upload folder active at: ${path.join(__dirname, "uploads")}`);
});
