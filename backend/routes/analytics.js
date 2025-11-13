const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

/* =========================================================
   ✅ CATEGORY BREAKDOWN (MONTHLY + YEARLY)
   /api/analytics/category-breakdown?type=expense&period=year
   ========================================================= */
router.get("/category-breakdown", async (req, res) => {
  try {
    const { type = "expense", period = "month" } = req.query;

    const match = {
      user: new mongoose.Types.ObjectId(req.userId),
      type,
    };

    const now = new Date();

    // ✅ Monthly → current month only
    if (period === "month") {
      match.date = {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      };
    }

    // ✅ Yearly → entire year
    if (period === "year") {
      match.date = {
        $gte: new Date(now.getFullYear(), 0, 1),
        $lte: new Date(now.getFullYear(), 11, 31),
      };
    }

    const breakdown = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json(
      breakdown.map((b) => ({
        category: b._id,
        amount: b.total,
      }))
    );
  } catch (error) {
    console.error("Category Breakdown Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* =========================================================
   ✅ MONTHLY TRENDS (Income vs Expense)
   /api/analytics/monthly-trends?months=6
   ========================================================= */
router.get("/monthly-trends", async (req, res) => {
  try {
    const months = Number(req.query.months || 6);

    const now = new Date();
    const past = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const trends = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.userId),
          date: { $gte: past },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
          },
          income: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          expense: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(
      trends.map((t) => ({
        month: `${t._id.month}/${t._id.year}`,
        income: t.income || 0,
        expense: t.expense || 0,
      }))
    );
  } catch (error) {
    console.error("Monthly Trends Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* =========================================================
   ✅ CATEGORY TRENDS (multi-line)
   /api/analytics/category-trends?months=6
   ========================================================= */
router.get("/category-trends", async (req, res) => {
  try {
    const months = Number(req.query.months || 6);

    const now = new Date();
    const past = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const raw = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.userId),
          type: "expense",
          date: { $gte: past },
        },
      },
      {
        $group: {
          _id: {
            category: "$category",
            month: { $month: "$date" },
            year: { $year: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          category: "$_id.category",
          month: {
            $concat: [
              { $toString: "$_id.month" },
              "/",
              { $toString: "$_id.year" },
            ],
          },
          total: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);

    // ✅ Format → { labels: [], series: { CatName: [..] } }
    const labels = [];
    const map = {};

    raw.forEach((row) => {
      if (!labels.includes(row.month)) labels.push(row.month);
      if (!map[row.category]) map[row.category] = {};
      map[row.category][row.month] = row.total;
    });

    const series = {};
    Object.keys(map).forEach((cat) => {
      series[cat] = labels.map((m) => map[cat][m] || 0);
    });

    res.json({ labels, series });
  } catch (error) {
    console.error("Category Trends Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
