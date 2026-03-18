const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
// We need to point to the correct model path. Assuming we are in /backend/
const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
    const email = "admin@cev.com"; // You can change this
    const password = "admin123"; // You can change this

    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cevconnect");
        console.log("Connected to MongoDB...");

        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log(`Admin with email ${email} already exists.`);
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new User({
            email,
            password: hashedPassword,
            role: "admin"
        });

        await admin.save();
        console.log("Admin user created successfully!");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();
