const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    password: { type: String, required: false }, // ✅ allow null for Google users
    googleId: { type: String, default: null },
    avatar: { type: String, default: null },
  },
  { timestamps: true }
);

// ✅ Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false; // Google user
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
