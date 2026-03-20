const User = require("../models/User");
const Item = require("../models/Item");

exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'cartItems',
            populate: { path: 'user', select: 'name email profilePic sellerLevel' }
        });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user.cartItems);
    } catch (error) {
        console.error("Cart fetch error:", error);
        res.status(500).json({ error: "Failed to fetch cart" });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const { itemId } = req.body;
        const user = await User.findById(req.user.id);
        
        // Check if item is already in cart
        if (user.cartItems.some(id => id.toString() === itemId)) {
            return res.status(400).json({ error: "Item already in cart" });
        }
        
        // Prevent adding own items
        const item = await Item.findById(itemId);
        if (!item) return res.status(404).json({ error: "Item not found" });
        if (item.user.toString() === req.user.id) {
            return res.status(400).json({ error: "Cannot add your own item to cart" });
        }
        if (item.status === "sold" || item.status === "delivered") {
            return res.status(400).json({ error: "Item is no longer available" });
        }

        user.cartItems.push(itemId);
        await user.save();
        res.json({ message: "Item added to cart", cartItems: user.cartItems });
    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({ error: "Failed to add to cart" });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const user = await User.findById(req.user.id);
        user.cartItems = user.cartItems.filter(id => id.toString() !== itemId);
        await user.save();
        res.json({ message: "Item removed from cart", cartItems: user.cartItems });
    } catch (error) {
        console.error("Remove from cart error:", error);
        res.status(500).json({ error: "Failed to remove from cart" });
    }
};
