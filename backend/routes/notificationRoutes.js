const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const auth = require("../middleware/auth");

router.get("/", auth, notificationController.getUserNotifications);
router.delete("/clear-read", auth, notificationController.clearReadNotifications);
router.put("/:id/read", auth, notificationController.markAsRead);

module.exports = router;
