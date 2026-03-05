const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    image: String,

    approved: {
      type: Boolean,
      default: false
    },

    // 🔥 ADD THIS FIELD
    status: {
      type: String,
      enum: ["available", "sold"],
      default: "available"
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);