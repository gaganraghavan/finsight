const RecurringTransaction = require('../models/RecurringTransaction');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

/**
 * Calculate the next date based on frequency
 */
const calculateNextDate = (currentDate, frequency) => {
  const nextDate = new Date(currentDate);
  
  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  
  return nextDate;
};

/**
 * Process all due recurring transactions
 */
const processRecurringTransactions = async () => {
  try {
    const now = new Date();
    
    // Find all active recurring transactions that are due
    const dueTransactions = await RecurringTransaction.find({
      isActive: true,
      nextDate: { $lte: now }
    });

    console.log('\n========================================');
    console.log(`🔄 Processing Recurring Transactions`);
    console.log(`📅 Date: ${now.toLocaleString()}`);
    console.log(`📊 Found ${dueTransactions.length} due recurring transactions`);
    console.log('========================================\n');

    let successCount = 0;
    let errorCount = 0;

    for (const recurring of dueTransactions) {
      try {
        // Check if end date has passed
        if (recurring.endDate && now > recurring.endDate) {
          recurring.isActive = false;
          await recurring.save();
          console.log(`❌ Deactivated expired recurring: ${recurring.name}`);
          continue;
        }

        // Create the transaction
        const transaction = new Transaction({
          user: recurring.user,
          type: recurring.type,
          amount: recurring.amount,
          category: recurring.category,
          description: recurring.description || `Recurring: ${recurring.name}`,
          date: now,
          tags: [...(recurring.tags || []), 'recurring'],
          isRecurring: true,
          recurringFrequency: recurring.frequency
        });

        await transaction.save();

        // Update next date and last processed
        recurring.nextDate = calculateNextDate(recurring.nextDate, recurring.frequency);
        recurring.lastProcessed = now;
        await recurring.save();

        successCount++;
        console.log(`✅ Processed: ${recurring.name}`);
        console.log(`   Type: ${recurring.type} | Amount: ₹${recurring.amount}`);
        console.log(`   Next Date: ${recurring.nextDate.toLocaleDateString()}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing recurring transaction ${recurring.name}:`, error.message);
      }
    }

    console.log('\n========================================');
    console.log(`✅ Success: ${successCount} | ❌ Errors: ${errorCount}`);
    console.log('========================================\n');

    return dueTransactions.length;
  } catch (error) {
    console.error('❌ Error in processRecurringTransactions:', error);
    throw error;
  }
};

/**
 * Display all active recurring transactions
 */
const displayActiveRecurring = async () => {
  try {
    const activeRecurring = await RecurringTransaction.find({
      isActive: true
    }).sort({ nextDate: 1 });

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║         ACTIVE RECURRING TRANSACTIONS                 ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    if (activeRecurring.length === 0) {
      console.log('📭 No active recurring transactions found.\n');
      return;
    }

    console.log(`📊 Total Active: ${activeRecurring.length}\n`);

    activeRecurring.forEach((rec, index) => {
      const nextDate = new Date(rec.nextDate);
      const startDate = new Date(rec.startDate);
      const endDate = rec.endDate ? new Date(rec.endDate) : null;
      
      console.log(`${index + 1}. ${rec.name}`);
      console.log(`   ├─ Type: ${rec.type === 'income' ? '💰' : '💸'} ${rec.type.toUpperCase()}`);
      console.log(`   ├─ Amount: ₹${rec.amount.toLocaleString()}`);
      console.log(`   ├─ Category: ${rec.category}`);
      console.log(`   ├─ Frequency: ${rec.frequency.toUpperCase()}`);
      console.log(`   ├─ Start Date: ${startDate.toLocaleDateString()}`);
      console.log(`   ├─ Next Date: ${nextDate.toLocaleDateString()}`);
      if (endDate) {
        console.log(`   ├─ End Date: ${endDate.toLocaleDateString()}`);
      }
      if (rec.description) {
        console.log(`   ├─ Description: ${rec.description}`);
      }
      if (rec.lastProcessed) {
        console.log(`   └─ Last Processed: ${new Date(rec.lastProcessed).toLocaleString()}`);
      } else {
        console.log(`   └─ Status: Pending first execution`);
      }
      console.log('');
    });

    console.log('════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Error displaying active recurring:', error);
  }
};

module.exports = { 
  processRecurringTransactions, 
  calculateNextDate,
  displayActiveRecurring
};