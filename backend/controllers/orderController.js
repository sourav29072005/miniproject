const Order = require("../models/Order");
const Item = require("../models/Item");
const Notification = require("../models/Notification");

// 🔹 CREATE ORDER
exports.createOrder = async (req, res) => {
    try {
        const { items, handoverLocation, customLocation } = req.body;
        // `items` is an array of objects: { itemId, price }
        // For backwards compatibility with single item checkout
        const checkoutItems = items || [{ itemId: req.body.itemId, price: req.body.price }];
        
        const buyerId = req.user.id;
        
        // We assume all items in a single checkout belong to the same seller!
        const firstItem = await Item.findById(checkoutItems[0].itemId);
        if (!firstItem) return res.status(404).json({ error: "Item not found" });
        
        const sellerId = firstItem.user;
        
        if (buyerId === sellerId.toString()) {
            return res.status(403).json({ error: "You cannot buy your own item." });
        }
        
        // Process all items
        const orderItems = [];
        let totalPrice = 0;
        let mainTitle = firstItem.title;

        for (const reqItem of checkoutItems) {
            const dbItem = await Item.findById(reqItem.itemId);
            if (!dbItem || dbItem.status === "sold" || dbItem.status === "delivered") continue;
            
            // Mark item as sold
            dbItem.status = "sold";
            await dbItem.save();
            
            const itemPrice = reqItem.price || dbItem.price;
            totalPrice += itemPrice;
            
            orderItems.push({
                itemId: dbItem._id,
                itemTitle: dbItem.title,
                itemImage: dbItem.images && dbItem.images.length > 0 ? dbItem.images[0] : dbItem.image,
                price: itemPrice
            });
        }
        
        if (orderItems.length === 0) {
            return res.status(400).json({ error: "No valid items to checkout" });
        }

        const newOrder = await Order.create({
            items: orderItems,
            totalPrice,
            buyerId,
            sellerId,
            status: "Pending",
            handoverLocation,
            customLocation
        });

        // Remove these items from the user's cart
        const User = require("../models/User");
        await User.findByIdAndUpdate(buyerId, {
            $pull: { cartItems: { $in: orderItems.map(i => i.itemId) } }
        });

        // Create notification for seller
        try {
            const notifMessage = orderItems.length > 1 
                ? `${orderItems.length} of your items have been ordered together!`
                : `Your item "${mainTitle}" has been ordered!`;
                
            await Notification.create({
                recipient: sellerId,
                message: notifMessage,
                type: "Order Placed",
                orderId: newOrder._id,
            });
        } catch (notifError) {
            console.error("Failed to create notification:", notifError);
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
            .populate("sellerId", "name email profilePic")
            .sort({ createdAt: -1 });
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
            .populate("buyerId", "name email profilePic")
            .sort({ createdAt: -1 });
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
            
            // Update items to delivered
            if (order.items && order.items.length > 0) {
                for (const i of order.items) {
                    await Item.findByIdAndUpdate(i.itemId, { status: "delivered" });
                }
            } else if (order.itemId) {
                await Item.findByIdAndUpdate(order.itemId, { status: "delivered" });
            }
            
            // Update Seller Earnings and Level Progression
            const User = require("../models/User");
            const seller = await User.findById(order.sellerId);
            if (seller) {
                const totalOrderValue = order.totalPrice || order.price || 0;
                seller.totalEarnings += totalOrderValue;
                seller.completedSales += 1;
                await seller.save();
                
                const { recalculateSellerLevel } = require("../utils/sellerProgression");
                await recalculateSellerLevel(seller._id);
            }
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
        // UNLESS the buyer has already confirmed receipt, which bypasses the timer.
        if (!order.buyerConfirmed) {
            const oneHourInMs = 1 * 60 * 60 * 1000;
            const orderCreationTime = new Date(order.createdAt).getTime();
            if (Date.now() - orderCreationTime < oneHourInMs) {
                const timeRemaining = Math.ceil((oneHourInMs - (Date.now() - orderCreationTime)) / 1000 / 60);
                return res.status(400).json({ error: `You can only confirm handover after 1 hour. Please wait ${timeRemaining} more minutes.` });
            }
        }

        order.sellerConfirmed = true;

        if (order.buyerConfirmed) {
            order.status = "Delivered";
            
            // Update items to delivered
            if (order.items && order.items.length > 0) {
                for (const i of order.items) {
                    await Item.findByIdAndUpdate(i.itemId, { status: "delivered" });
                }
            } else if (order.itemId) {
                await Item.findByIdAndUpdate(order.itemId, { status: "delivered" });
            }

            // Update Seller Earnings and Level Progression
            const User = require("../models/User");
            const seller = await User.findById(order.sellerId);
            if (seller) {
                const totalOrderValue = order.totalPrice || order.price || 0;
                seller.totalEarnings += totalOrderValue;
                seller.completedSales += 1;
                await seller.save();
                
                const { recalculateSellerLevel } = require("../utils/sellerProgression");
                await recalculateSellerLevel(seller._id);
            }
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

        if (order.items && order.items.length > 0) {
            for (const i of order.items) {
                await Item.findByIdAndUpdate(i.itemId, { status: "available" });
            }
        } else if (order.itemId) {
            await Item.findByIdAndUpdate(order.itemId, { status: "available" });
        }

        // Create notification for seller
        try {
                await Notification.create({
                    recipient: order.sellerId,
                    message: `An order for your items was cancelled.`,
                    type: "Order Cancelled",
                    orderId: order._id,
                });
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
