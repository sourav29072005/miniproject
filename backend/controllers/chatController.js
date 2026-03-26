const Conversation = require("../models/Conversation");
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User");

// 🔹 GET ALL CONVERSATIONS FOR A USER
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    let conversations = await Conversation.find({ participants: userId })
      .populate("participants", "name email profilePic")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    conversations = conversations.map(convo => {
      const c = convo.toObject();
      const clearedAt = convo.clearedAt && convo.clearedAt.get(userId.toString());
      if (clearedAt && c.lastMessage && new Date(c.lastMessage.createdAt) <= new Date(clearedAt)) {
          c.lastMessage = null;
      }
      return c;
    });

    res.json(conversations);
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ error: "Failed to load conversations" });
  }
};

// 🔹 GET MESSAGES FOR A SPECIFIC CONVERSATION
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // Check if user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
    }
    
    if (!conversation.participants.includes(req.user.id)) {
        return res.status(403).json({ error: "Not authorized to view these messages" });
    }

    const clearedAt = conversation.clearedAt && conversation.clearedAt.get(req.user.id.toString());
    const query = { conversationId };
    if (clearedAt) {
        query.createdAt = { $gt: new Date(clearedAt) };
    }

    const messages = await ChatMessage.find(query).sort({ createdAt: 1 });
    
    // Clear unread count for this user when they fetch messages
    conversation.unreadCounts.set(req.user.id.toString(), 0);
    await conversation.save();

    res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ error: "Failed to load messages" });
  }
};

// 🔹 GET TOTAL UNREAD COUNT
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({ participants: userId });
    
    let totalUnread = 0;
    for (const convo of conversations) {
      totalUnread += (convo.unreadCounts.get(userId.toString()) || 0);
    }

    res.json({ unreadCount: totalUnread });
  } catch (err) {
    console.error("Get unread count error:", err);
    res.status(500).json({ error: "Failed to load unread count" });
  }
};

// 🔹 START (OR GET EXISTING) CONVERSATION
exports.startConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user.id;

    console.log(`[ChatController] startConversation: sender=${senderId}, recipient=${recipientId}`);

    if (!recipientId) {
       return res.status(400).json({ error: "Recipient ID is required" });
    }

    if (recipientId === senderId) {
       return res.status(400).json({ error: "You cannot start a conversation with yourself" });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      console.warn(`[ChatController] recipient not found: ${recipientId}`);
      return res.status(404).json({ error: "User not found", recipientId });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] }
    }).populate("participants", "name email profilePic");

    if (conversation) {
      return res.status(200).json(conversation);
    }

    // Otherwise, create a new one
    conversation = await Conversation.create({
      participants: [senderId, recipientId],
      unreadCounts: {
        [senderId.toString()]: 0,
        [recipientId.toString()]: 0,
      }
    });

    const populatedConversation = await Conversation.findById(conversation._id)
       .populate("participants", "name email profilePic");

    res.status(201).json(populatedConversation);
  } catch (err) {
    console.error("Start conversation error:", err);
    res.status(500).json({ error: "Failed to start conversation" });
  }
};

// 🔹 CLEAR CHAT FOR A USER
exports.clearChat = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
    }
    
    if (!conversation.participants.includes(req.user.id)) {
        return res.status(403).json({ error: "Not authorized to modify this chat" });
    }

    if (!conversation.clearedAt) {
        conversation.clearedAt = new Map();
    }
    
    // Set clearedAt to current time
    conversation.clearedAt.set(req.user.id.toString(), new Date());
    await conversation.save();

    res.json({ message: "Chat cleared successfully" });
  } catch (err) {
    console.error("Clear chat error:", err);
    res.status(500).json({ error: "Failed to clear chat" });
  }
};

// 🔹 DELETE CONVERSATION ENTIRELY
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
    }
    
    if (!conversation.participants.includes(req.user.id)) {
        return res.status(403).json({ error: "Not authorized to delete this chat" });
    }

    // Delete all messages
    const ChatMessage = require("../models/ChatMessage");
    await ChatMessage.deleteMany({ conversationId });
    
    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);

    res.json({ message: "Conversation deleted successfully" });
  } catch (err) {
    console.error("Delete conversation error:", err);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
};
