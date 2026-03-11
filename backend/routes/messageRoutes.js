const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// User routes
router.get("/", auth, messageController.getUserMessages);
router.get("/unread-count", auth, messageController.getUnreadCount);
router.put("/:id/read", auth, messageController.markAsRead);
router.put("/read-all/all", auth, messageController.markAllAsRead);
router.delete("/:id", auth, messageController.deleteMessage);
router.delete("/delete-all/all", auth, messageController.deleteAllMessages);

// Admin routes
router.post("/send", auth, admin, messageController.sendMessage);

module.exports = router;
