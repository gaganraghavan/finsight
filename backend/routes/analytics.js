const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

// Spending by Category
router.get("/category-breakdown", auth, async (req, res) => {
  try {
    const breakdown = await Transaction.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.userId), type: "expense" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } }
    ]);

    res.json(
      breakdown.map((b) => ({
        category: b._id,
        amount: b.total
      }))
    );
  } catch (err) {
    res.status(500).json({ message: "Error fetching category breakdown", error: err.message });
  }
});

// Monthly income vs expense trend
router.get("/monthly-trends", auth, async (req, res) => {
  try {
    const trends = await Transaction.aggregate([
      { $match: { user: mongoose.Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" }, type: "$type" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const formatted = {};
    trends.forEach((t) => {
      const key = `${t._id.year}-${String(t._id.month).padStart(2, "0")}`;
      if (!formatted[key]) formatted[key] = { month: key, income: 0, expense: 0 };
      formatted[key][t._id.type] = t.total;
    });

    res.json(Object.values(formatted));
  } catch (err) {
    res.status(500).json({ message: "Error fetching monthly trends", error: err.message });
  }
});

module.exports = router;
