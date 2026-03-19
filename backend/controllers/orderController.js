const Order = require("../models/Order");
const Item = require("../models/Item");
const Notification = require("../models/Notification");

// 🔹 CREATE ORDER
exports.createOrder = async (req, res) => {
    try {
        const { itemId, price, handoverLocation, customLocation } = req.body;
        const buyerId = req.user.id;

        console.log(`Creating order for Item: ${itemId}, Buyer: ${buyerId}`);

        // Get item to ensure it exists and get sellerId/title
        const item = await Item.findById(itemId);
        if (!item) {
            console.error(`Item not found: ${itemId}`);
            return res.status(404).json({ error: "Item not found" });
        }

        const sellerId = item.user;
        if (!sellerId) {
            console.error(`Seller not found for item: ${itemId}`);
            return res.status(400).json({ error: "Seller information missing for this item" });
        }

        // Prevent self-purchase
        if (buyerId === sellerId.toString()) {
            return res.status(403).json({ error: "You cannot buy your own item." });
        }

        const newOrder = await Order.create({
            itemId,
            buyerId,
            sellerId,
            price: price || item.price,
            status: "Pending",
            itemTitle: item.title,
            itemImage: item.images && item.images.length > 0 ? item.images[0] : item.image,
            handoverLocation,
            customLocation
        });

        // Mark item as sold
        item.status = "sold";
        await item.save();

        console.log(`Order created: ${newOrder._id}. Creating notification for seller: ${sellerId}`);

        // Create notification for seller
        try {
            await Notification.create({
                recipient: sellerId,
                message: `Your item "${item.title}" has been ordered!`,
                type: "Order Placed",
                orderId: newOrder._id,
            });
            console.log("Notification created successfully");
        } catch (notifError) {
            console.error("Failed to create notification:", notifError);
            // We don't return error here because the order was already created successfully
        }

        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
};

// 🔹 GET BUYER ORDERS
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyerId: req.user.id })
            .populate("itemId")
            .populate("sellerId", "name email profilePic");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
};

// 🔹 GET SELLER ORDERS
exports.getMySales = async (req, res) => {
    try {
        const orders = await Order.find({ sellerId: req.user.id })
            .populate("itemId")
            .populate("buyerId", "name email profilePic");
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

        // Verify if the user is the seller
        if (order.sellerId.toString() !== req.user.id) {
            return res.status(401).json({ error: "Only the seller can confirm handover" });
        }

        // Check 1-hour time constraint - seller can only confirm after 1 hour from order creation
        const oneHourInMs = 1 * 60 * 60 * 1000;
        const orderCreationTime = new Date(order.createdAt).getTime();
        if (Date.now() - orderCreationTime < oneHourInMs) {
            const timeRemaining = Math.ceil((oneHourInMs - (Date.now() - orderCreationTime)) / 1000 / 60);
            return res.status(400).json({ error: `You can only confirm handover after 1 hour. Please wait ${timeRemaining} more minutes.` });
        }

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

// 🔹 CANCEL ORDER (BUYER)
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });

        // Verify if the user is the buyer
        if (order.buyerId.toString() !== req.user.id) {
            return res.status(401).json({ error: "Only the buyer can cancel this order" });
        }

        // Check if order is already cancelled or delivered
        if (order.status === "Cancelled" || order.status === "Delivered") {
            return res.status(400).json({ error: "Cannot cancel an order that is already completed or cancelled" });
        }

        // Check 1-hour time limit
        const oneHour = 1 * 60 * 60 * 1000;
        if (Date.now() - new Date(order.createdAt).getTime() > oneHour) {
            return res.status(400).json({ error: "Cancellation period (1 hour) has expired" });
        }

        // Update status and restore item
        order.status = "Cancelled";
        await order.save();

        const item = await Item.findByIdAndUpdate(order.itemId, { status: "available" }, { new: true });

        console.log(`Order ${order._id} cancelled. Restoring item ${order.itemId}.`);

        // Create notification for seller
        try {
            if (item) {
                await Notification.create({
                    recipient: order.sellerId,
                    message: `Order for your item "${item.title}" has been cancelled.`,
                    type: "Order Cancelled",
                    orderId: order._id,
                });
                console.log("Cancellation notification created for seller:", order.sellerId);
            } else {
                console.warn("Item not found during cancellation notification creation");
            }
        } catch (notifError) {
            console.error("Failed to create cancellation notification:", notifError);
        }

        res.json({ message: "Order cancelled successfully", order });
    } catch (error) {
        console.error("Cancel order error:", error);
        res.status(500).json({ error: "Failed to cancel order" });
    }
};

// 🔹 SCHEDULE HANDOVER (SELLER)
exports.scheduleHandover = async (req, res) => {
    try {
        const { handoverDate, handoverTime } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) return res.status(404).json({ error: "Order not found" });

        // Verify if the user is the seller
        if (order.sellerId.toString() !== req.user.id) {
            return res.status(401).json({ error: "Only the seller can schedule handover" });
        }

        order.handoverDate = handoverDate;
        order.handoverTime = handoverTime;
        
        await order.save();
        
        // Notify buyer
        try {
            const Notification = require("../models/Notification");
            await Notification.create({
                recipient: order.buyerId,
                message: `Handover scheduled for your order "${order.itemTitle}" on ${new Date(handoverDate).toLocaleDateString()} at ${handoverTime}.`,
                type: "Handover Scheduled",
                orderId: order._id,
            });
        } catch (notifError) {
             console.error("Failed to create notification:", notifError);
        }

        res.json({ message: "Handover scheduled successfully", order });
    } catch (error) {
        console.error("Schedule handover error:", error);
        res.status(500).json({ error: "Failed to schedule handover" });
    }
};
