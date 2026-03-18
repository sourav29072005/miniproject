const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const Notification = require("./models/Notification");

async function testNotif() {
    try {
        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cevconnect";
        await mongoose.connect(uri);
        console.log("Connected to MongoDB for manual test");

        const user = await User.findOne();
        if (!user) {
            console.error("No users found to test with");
            process.exit(1);
        }

        console.log(`Creating test notification for user: ${user._id} (${user.email})`);

        const notif = await Notification.create({
            recipient: user._id,
            message: "Test notification at " + new Date().toISOString(),
            type: "Order Placed",
            isRead: false
        });

        console.log("Notification created successfully:", notif._id);

        const found = await Notification.findById(notif._id);
        console.log("Fetched notification from DB:", found ? "YES" : "NO");

        process.exit(0);
    } catch (error) {
        console.error("TEST NOTIFICATION ERROR:", error);
        process.exit(1);
    }
}

testNotif();
