const Message = require("../models/Message");
const User = require("../models/User");

// 🔹 SEND MESSAGE (ADMIN TO USER)
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, subject, message, type } = req.body;

    // Verify sender is admin
    const sender = await User.findById(req.user.id);
    if (sender.role !== "admin") {
      return res.status(403).json({ error: "Only admins can send messages" });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: "User not found" });
    }

    const newMessage = await Message.create({
      sender: req.user.id,
      recipient: recipientId,
      subject,
      message,
      type: type || "info",
    });

    const populatedMessage = await newMessage.populate("sender", "name profilePic");

    res.status(201).json({
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// 🔹 GET USER MESSAGES
exports.getUserMessages = async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.user.id })
      .populate("sender", "name profilePic email role")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// 🔹 GET UNREAD MESSAGES COUNT
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
};

// 🔹 MARK MESSAGE AS READ
exports.markAsRead = async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    ).populate("sender", "name profilePic email");

    res.json(msg);
  } catch (error) {
    res.status(500).json({ error: "Failed to mark message as read" });
  }
};

// 🔹 MARK ALL AS READ
exports.markAllAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      { recipient: req.user.id, isRead: false },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.json({ message: "All messages marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
};

// 🔹 DELETE MESSAGE
exports.deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);

    if (!msg) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if user is the recipient
    if (msg.recipient.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message" });
  }
};

// 🔹 DELETE ALL MESSAGES
exports.deleteAllMessages = async (req, res) => {
  try {
    await Message.deleteMany({ recipient: req.user.id });
    res.json({ message: "All messages deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete messages" });
  }
};
