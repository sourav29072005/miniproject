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
    images: [String],

    approved: {
      type: Boolean,
      default: false
    },

    category: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["available", "sold"],
      default: "available"
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    rejectionReason: {
      type: String,
      default: null
    },

    rejectedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);


module.exports = mongoose.model("Item", itemSchema);