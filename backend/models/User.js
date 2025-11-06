const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    password: { type: String }, // remains for normal login
    googleId: { type: String, default: null }, // NEW ✅
    avatar: { type: String, default: null }, // NEW ✅
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
