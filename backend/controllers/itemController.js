const Item = require("../models/Item");

// 🔹 ADD ITEM
exports.addItem = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;

    if (!req.user?.id) {
      console.error("ADD ITEM ERROR: No user ID in request context!");
      return res.status(401).json({ error: "Unauthorized: Missing user ID" });
    }

    const images = req.files ? req.files.map(f => f.path) : [];
    const itemData = {
      title,
      description,
      price: Number(price),
      category: category || "Uncategorized",
      image: images[0] || null,
      images,
      user: req.user.id,
      approved: false,
      status: "available",
    };

    const item = await Item.create(itemData);
    res.status(201).json(item);
  } catch (error) {
    console.error("ADD ITEM CATCH ERROR:", error);
    res.status(500).json({ error: "Failed to add item", details: error.message });
  }
};

// 🔹 GET APPROVED + AVAILABLE ITEMS (FOR MARKETPLACE)
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find({
      approved: true,
      status: { $ne: "sold" },
    }).populate("user", "email name profilePic sellerLevel averageRating totalReviews");

    res.json(items);
  } catch (error) {
    console.error("getItems error:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
};

// 🔹 GET SINGLE ITEM
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("user", "email name profilePic sellerLevel averageRating totalReviews");
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch item" });
  }
};

// 🔹 GET USER ITEMS
exports.getUserItems = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      console.error("getUserItems - user.id is missing!");
      return res.status(401).json({ error: "Authentication failed: No user ID found" });
    }

    const items = await Item.find({ user: userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error("getUserItems error:", error);
    res.status(500).json({ error: "Failed to fetch user items" });
  }
};

// 🔹 GET PENDING ITEMS (ADMIN)
exports.getPendingItems = async (req, res) => {
  try {
    const items = await Item.find({ approved: false, rejectionReason: null }).populate("user", "name email profilePic");
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending items" });
  }
};

// 🔹 APPROVE ITEM (ADMIN)
exports.approveItem = async (req, res) => {
  try {
    const Notification = require("../models/Notification");

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    await Item.findByIdAndUpdate(req.params.id, {
      approved: true,
    });

    // Create notification for seller
    try {
      await Notification.create({
        recipient: item.user,
        message: `Your item "${item.title}" has been approved! 🎉 It's now live in the marketplace.`,
        type: "Item Approved",
        itemId: item._id,
      });
    } catch (notifError) {
      console.error("Failed to create approval notification:", notifError);
    }

    res.json({ message: "Item approved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve item" });
  }
};

// 🔹 REJECT ITEM (ADMIN)
exports.rejectItem = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const Notification = require("../models/Notification");

    if (!rejectionReason || rejectionReason.trim() === "") {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Update item with rejection
    item.rejectionReason = rejectionReason;
    item.rejectedAt = new Date();
    item.approved = false;
    await item.save();

    // Create notification for user
    try {
      await Notification.create({
        recipient: item.user,
        message: `Your item "${item.title}" has been rejected. Reason: ${rejectionReason}`,
        type: "Item Rejected",
        itemId: item._id,
      });
    } catch (notifError) {
      console.error("Failed to create rejection notification:", notifError);
    }

    res.json({ message: "Item rejected successfully", item });
  } catch (error) {
    console.error("Reject item error:", error);
    res.status(500).json({ error: "Failed to reject item" });
  }
};

// 🔹 DELETE ITEM
exports.deleteItem = async (req, res) => {
  try {
    const Order = require("../models/Order");
    const activeOrder = await Order.findOne({
      itemId: req.params.id,
      status: { $nin: ["Cancelled", "Delivered"] }
    });

    if (activeOrder) {
      return res.status(400).json({ error: "Cannot delete an item with an active order." });
    }

    // BACKFILL SNAPSHOT: If this was an old item that didn't record snapshot data when the order was placed,
    // grab it right now and stamp it onto the Order history so the buyer's UI doesn't break.
    const itemToDelete = await Item.findById(req.params.id);
    if (itemToDelete) {
      await Order.updateMany(
        { itemId: req.params.id },
        {
          $set: {
            itemTitle: itemToDelete.title,
            itemImage: itemToDelete.images && itemToDelete.images.length > 0 ? itemToDelete.images[0] : itemToDelete.image
          }
        }
      );
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item" });
  }
};

exports.markSold = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.status = "sold";
    await item.save();

    res.json({ message: "Item marked as sold", item });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ error: "Item not found" });

    // Check if user is owner or admin
    if (item.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({ error: "Not authorized" });
    }

    item.title = title || item.title;
    item.description = description || item.description;
    item.price = price || item.price;
    item.category = category || item.category;

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to update item" });
  }
};

// 🔹 GET ITEMS BY USER ID (PUBLIC)
exports.getItemsByUser = async (req, res) => {
  try {
    const items = await Item.find({
      user: req.params.userId,
      approved: true,
      status: "available"
    }).populate("user", "name profilePic email sellerLevel averageRating totalReviews");

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user items" });
  }
};
