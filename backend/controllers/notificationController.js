const Notification = require("../models/Notification");

// 🔹 GET USER NOTIFICATIONS
exports.getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .populate("orderId");
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

// 🔹 MARK AS READ
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: "Failed to mark notification as read" });
    }
};

// 🔹 CLEAR READ NOTIFICATIONS
exports.clearReadNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user.id, isRead: true });
        res.json({ message: "Read notifications cleared successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to clear notifications" });
    }
};
