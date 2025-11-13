const express = require("express");
const PDFDocument = require("pdfkit");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

const router = express.Router();

// ✅ Export all user transactions as PDF
router.get("/transactions/pdf", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId }).sort({ date: -1 });

    // Create PDF document
    const doc = new PDFDocument({ margin: 40 });

    const filename = `transactions_${Date.now()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    doc.pipe(res);

    // ✅ Title
    doc.fontSize(20).text("Transaction Report", { align: "center" });
    doc.moveDown();

    // ✅ Table header
    doc.fontSize(12);
    doc.text("Date", 40, doc.y, { continued: true });
    doc.text("Name", 150, doc.y, { continued: true });
    doc.text("Type", 300, doc.y, { continued: true });
    doc.text("Category", 380, doc.y, { continued: true });
    doc.text("Amount", 480);
    doc.moveDown();

    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();

    // ✅ Add each transaction
    transactions.forEach((t) => {
      doc.text(new Date(t.date).toLocaleDateString(), 40, doc.y, { continued: true });
      doc.text(t.name, 150, doc.y, { continued: true });
      doc.text(t.type, 300, doc.y, { continued: true });
      doc.text(t.category, 380, doc.y, { continued: true });
      doc.text(`₹${t.amount}`, 480);
    });

    doc.end();

  } catch (err) {
    console.error("PDF export error:", err);
    res.status(500).json({ message: "Failed to export PDF" });
  }
});

module.exports = router;
