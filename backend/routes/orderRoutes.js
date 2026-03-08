const express = require("express");
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getMySales,
    confirmReceipt,
    confirmHandedOver,
    cancelOrder
} = require("../controllers/orderController");

// The middleware is actually in the middleware folder (or we need to find it)
const authMiddleware = require("../middleware/auth"); // Assuming this is the correct name


// Protected routes (require user to be logged in)
router.post("/", authMiddleware, createOrder);
router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/my-sales", authMiddleware, getMySales);
router.put("/:id/confirm-receipt", authMiddleware, confirmReceipt);
router.put("/:id/confirm-handed-over", authMiddleware, confirmHandedOver);
router.put("/:id/cancel", authMiddleware, cancelOrder);

module.exports = router;
