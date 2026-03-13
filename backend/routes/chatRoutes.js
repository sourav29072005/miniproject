const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const auth = require("../middleware/auth");

router.get("/conversations", auth, chatController.getConversations);
router.get("/unread-count", auth, chatController.getUnreadCount);
router.get("/:conversationId/messages", auth, chatController.getMessages);
router.post("/start", auth, chatController.startConversation);

module.exports = router;
