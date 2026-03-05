const Order = require("../models/Order");
const Item = require("../models/Item");

// 🔹 CREATE ORDER
exports.createOrder = async (req, res) => {
    try {
        const { itemId, sellerId, price } = req.body;
        const buyerId = req.user.id;

        const newOrder = await Order.create({
            itemId,
            buyerId,
            sellerId,
            price,
            status: "Pending",
        });

        // Mark item as sold (pending delivery)
        await Item.findByIdAndUpdate(itemId, { status: "sold" });

        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: "Failed to create order" });
    }
};

// 🔹 GET BUYER ORDERS
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyerId: req.user.id }).populate("itemId");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};

// 🔹 GET SELLER ORDERS
exports.getMySales = async (req, res) => {
    try {
        const orders = await Order.find({ sellerId: req.user.id }).populate("itemId");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch sales" });
    }
};

// 🔹 CONFIRM RECEIPT (BUYER)
exports.confirmReceipt = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });

        order.buyerConfirmed = true;

        if (order.sellerConfirmed) {
            order.status = "Delivered";
            await Item.findByIdAndUpdate(order.itemId, { status: "delivered" });
        } else {
            order.status = "Pending Seller Confirmation";
        }

        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: "Failed to confirm receipt" });
    }
};

// 🔹 CONFIRM HANDED OVER (SELLER)
exports.confirmHandedOver = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });

        order.sellerConfirmed = true;

        if (order.buyerConfirmed) {
            order.status = "Delivered";
            await Item.findByIdAndUpdate(order.itemId, { status: "delivered" });
        } else {
            order.status = "Pending Buyer Confirmation";
        }

        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: "Failed to confirm hand over" });
    }
};
