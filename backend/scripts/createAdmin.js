const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@cev.com" });
    if (existingAdmin) {
      console.log("⚠️  Admin already exists with email: admin@cev.com");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create admin user
    const admin = await User.create({
      email: "admin@cev.com",
      name: "Admin",
      password: hashedPassword,
      role: "admin",
      profilePic: null,
      department: "Administration",
      bio: "Administrator Account"
    });

    console.log("✅ Admin created successfully!");
    console.log("📧 Email: admin@cev.com");
    console.log("🔑 Password: admin123");
    console.log("👤 Name:", admin.name);
    console.log("⚙️  Role:", admin.role);
    console.log("🆔 ID:", admin._id);

    await mongoose.disconnect();
    console.log("\n✅ Database disconnected. Admin setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
