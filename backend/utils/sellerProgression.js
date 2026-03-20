const User = require("../models/User");

/**
 * Recalculates and saves the seller's level based on sales and reviews.
 * Level 1: New Seller (Default)
 * Level 2: Intermediate (2+ sales, Avg Rating >= 4.0)
 * Level 3: Advanced (5+ sales, Avg Rating >= 4.2)
 * Level 4: Top Rated Seller (10+ sales, Avg Rating >= 4.5)
 */
exports.recalculateSellerLevel = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    let newLevel = "New Seller";

    if (user.completedSales >= 10 && user.averageRating >= 4.5) {
      newLevel = "Top Rated Seller";
    } else if (user.completedSales >= 5 && user.averageRating >= 4.2) {
      newLevel = "Advanced";
    } else if (user.completedSales >= 2 && user.averageRating >= 4.0) {
      newLevel = "Intermediate";
    }

    if (user.sellerLevel !== newLevel) {
      user.sellerLevel = newLevel;
      await user.save();
    }
  } catch (error) {
    console.error("Failed to recalculate seller level:", error);
  }
};
