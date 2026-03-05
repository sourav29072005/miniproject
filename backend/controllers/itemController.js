const Item = require("../models/Item");

// 🔹 ADD ITEM
exports.addItem = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;

    const item = await Item.create({
      title,
      description,
      price,
      category,
      image: req.file ? req.file.filename : null,
      user: req.user.id,
      approved: true, // must be approved by admin
      status: "available",
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to add item" });
  }
};

// 🔹 GET APPROVED + AVAILABLE ITEMS (FOR MARKETPLACE)
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find({
      approved: true,
      status: { $ne: "sold" },
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
};

// 🔹 GET USER ITEMS
exports.getUserItems = async (req, res) => {
  try {
    const items = await Item.find({ user: req.user.id });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user items" });
  }
};

// 🔹 GET PENDING ITEMS (ADMIN)
exports.getPendingItems = async (req, res) => {
  try {
    const items = await Item.find({ approved: false });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending items" });
  }
};

// 🔹 APPROVE ITEM (ADMIN)
exports.approveItem = async (req, res) => {
  try {
    await Item.findByIdAndUpdate(req.params.id, {
      approved: true,
    });

    res.json({ message: "Item approved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve item" });
  }
};

// 🔹 DELETE ITEM
exports.deleteItem = async (req, res) => {
  try {
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