const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

/**
 * GET /api/analytics/category-breakdown
 * Returns category totals (for expenses)
 */
router.get("/category-breakdown", async (req, res) => {
  try {
    const { type = "expense" } = req.query;

    const breakdown = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.userId),
          type,
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    // ✅ Format for frontend
    const formatted = breakdown.map((b) => ({
      category: b._id,
      amount: b.total,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Category Breakdown Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * GET /api/analytics/monthly-trends
 * Returns income vs expense grouped by month
 */
router.get("/monthly-trends", async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const monthsBack = Number(months);

    const trends = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.userId),
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
          },
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 },
      },
      { $limit: monthsBack },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }, // reorder chronological
      },
    ]);

    // ✅ Format month names properly
    const formatted = trends.map((t) => ({
      month: `${t._id.month}/${t._id.year}`,
      income: t.income || 0,
      expense: t.expense || 0,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Monthly Trends Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
