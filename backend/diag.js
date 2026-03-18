const mongoose = require("mongoose");
require("dotenv").config();
const Item = require("./models/Item");
const Order = require("./models/Order");
const User = require("./models/User");
const Notification = require("./models/Notification");

async function diag() {
    try {
        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cevconnect";
        console.log("Connecting to:", uri);
        await mongoose.connect(uri);
        console.log("Connected to MongoDB for diagnostics");

        const users = await User.find();
        console.log("\n--- ALL USERS ---");
        users.forEach(u => console.log(`ID: ${u._id}, Email: ${u.email}`));

        const items = await Item.find().sort({ createdAt: -1 });
        console.log("\n--- ALL ITEMS ---");
        items.forEach(i => console.log(`ID: ${i._id}, Title: ${i.title}, Seller: ${i.user}, Status: ${i.status}`));

        const orders = await Order.find().sort({ createdAt: -1 });
        console.log("\n--- ALL ORDERS ---");
        orders.forEach(o => console.log(`ID: ${o._id}, Item: ${o.itemId}, Buyer: ${o.buyerId}, Seller: ${o.sellerId}, Status: ${o.status}`));

        const notifications = await Notification.find().sort({ createdAt: -1 });
        console.log("\n--- ALL NOTIFICATIONS ---");
        notifications.forEach(n => console.log(`ID: ${n._id}, To: ${n.recipient}, Type: ${n.type}, Msg: ${n.message}`));

        process.exit(0);
    } catch (error) {
        console.error("DIAGNOSTICS ERROR:", error);
        process.exit(1);
    }
}

diag();
