const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["Order Placed", "Order Cancelled", "Item Approved", "Item Rejected"],
            required: true,
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
