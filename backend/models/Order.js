const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        // Legacy single-item structure (fallback for old data)
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
        },
        price: {
            type: Number,
        },
        itemTitle: {
            type: String,
        },
        itemImage: {
            type: String,
        },

        // Multi-item structure
        items: [
            {
                itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
                itemTitle: String,
                itemImage: String,
                price: Number
            }
        ],
        totalPrice: {
            type: Number,
            default: 0
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
        status: {
            type: String,
            enum: ["Cancelled", "Pending", "Pending Buyer Confirmation", "Pending Seller Confirmation", "Delivered"],
            default: "Pending",
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
        hasReviewed: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
