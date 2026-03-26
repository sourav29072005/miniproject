const Review = require("../models/Review");
const User = require("../models/User");
const Order = require("../models/Order");
const { recalculateSellerLevel } = require("../utils/sellerProgression");

// 🔹 Add a Review
exports.addReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    const reviewerId = req.user.id;

    // 1. Verify Order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.buyerId.toString() !== reviewerId) {
      return res.status(403).json({ error: "Only the buyer can review this order" });
    }

    if (order.status !== "Delivered") {
      return res.status(400).json({ error: "You can only review items that have been delivered" });
    }

    // 2. Check for existing review
    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return res.status(400).json({ error: "You have already reviewed this transaction" });
    }

    // 3. Create Review
    const sellerId = order.sellerId;
    const newReview = new Review({
      reviewerId,
      sellerId,
      orderId,
      rating,
      comment
    });
    await newReview.save();

    // UPDATE ORDER
    order.hasReviewed = true;
    await order.save();

    // 4. Update Seller's Stats
    const seller = await User.findById(sellerId);
    const newTotalReviews = seller.totalReviews + 1;
    const newAverageRating = ((seller.averageRating * seller.totalReviews) + rating) / newTotalReviews;

    seller.totalReviews = newTotalReviews;
    seller.averageRating = Number(newAverageRating.toFixed(1)); // Keep 1 decimal place
    await seller.save();

    // 5. Recalculate Level
    await recalculateSellerLevel(sellerId);

    res.status(201).json({ message: "Review submitted successfully", review: newReview });
  } catch (err) {
    console.error("Add review error:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
};

// 🔹 Get Seller Reviews
exports.getSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const reviews = await Review.find({ sellerId })
      .populate("reviewerId", "name profilePic")
      .populate({
        path: "orderId",
        select: "itemTitle itemImage price itemId items",
        populate: [
          {
            path: "itemId",
            select: "title image"
          },
          {
            path: "items.itemId",
            select: "title image"
          }
        ]
      })
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("Get seller reviews error:", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};
