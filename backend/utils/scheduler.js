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

    console.log(`Found ${dueTransactions.length} due recurring transactions`);

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

        console.log(`✅ Processed recurring transaction: ${recurring.name} (₹${recurring.amount})`);
      } catch (error) {
        console.error(`❌ Error processing recurring transaction ${recurring.name}:`, error);
      }
    }

    console.log(`✅ Completed processing ${dueTransactions.length} recurring transactions`);
    return dueTransactions.length;
  } catch (error) {
    console.error('❌ Error in processRecurringTransactions:', error);
    throw error;
  }
};

module.exports = { 
  processRecurringTransactions, 
  calculateNextDate 
};