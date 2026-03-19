const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true,
        },
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["Cancelled", "Pending", "Pending Buyer Confirmation", "Pending Seller Confirmation", "Delivered"],
            default: "Pending",
        },
        itemTitle: {
            type: String, // Store snapshot in case item is deleted
        },
        itemImage: {
            type: String, // Store snapshot in case item is deleted
        },
        buyerConfirmed: {
            type: Boolean,
            default: false,
        },
        sellerConfirmed: {
            type: Boolean,
            default: false,
        },
        handoverLocation: {
            type: String,
        },
        customLocation: {
            type: String,
        },
        handoverDate: {
            type: Date,
        },
        handoverTime: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
