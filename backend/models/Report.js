const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedEntity: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // Ref can be dynamic based on entityModel, but we'll fetch manually if needed or use refPath
      refPath: 'entityModel'
    },
    entityModel: {
      type: String,
      required: true,
      enum: ["Item", "User"], // Can expand later
    },
    reason: {
      type: String,
      required: true,
      enum: ["Fake Item", "Inappropriate Content", "Scam", "Spam", "Other", "Harassment"],
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Resolved", "Dismissed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
