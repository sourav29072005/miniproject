const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: "user"
  },
  profilePic: {
    type: String,
    default: null
  },
  department: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: null
  },
  bannedAt: {
    type: Date,
    default: null
  },
  graduationYear: {
    type: String,
    default: null
  },
  // --- Cart ---
  cartItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }],
  // --- Seller Progression & Earnings ---
  sellerLevel: {
    type: String,
    default: "New Seller",
    enum: ["New Seller", "Intermediate", "Advanced", "Top Rated Seller"]
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  completedSales: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);