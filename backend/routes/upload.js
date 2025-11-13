const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// CREATE uploads folder if not exists
const fs = require("fs");
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${req.userId}_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

// ✅ UPLOAD AVATAR
router.post("/profile-photo", auth, upload.single("avatar"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  console.log("✅ Saved File:", req.file.path);

  await User.findByIdAndUpdate(req.userId, { avatar: fileUrl });

  res.json({ avatar: fileUrl });
});

module.exports = router;
