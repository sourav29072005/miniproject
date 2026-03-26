const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// REGISTER
exports.registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email.endsWith("@cev.ac.in")) {
      return res.status(400).json({ error: "Registration restricted to @cev.ac.in emails only" });
    }

    const profilePic = req.file ? req.file.path : null;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      name,
      password: hashedPassword,
      role: "user",
      profilePic
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePic: user.profilePic
      },
    });

  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(400).json({ error: "Registration failed: " + error.message });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({ 
        error: "Your account has been banned",
        banned: true,
        banReason: user.banReason
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePic: user.profilePic,
        department: user.department,
        graduationYear: user.graduationYear,
        bio: user.bio
      },
    });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
       console.error("Auth middleware did not provide req.user.id");
       return res.status(401).json({ error: "Authentication failed. No user ID found." });
    }

    const { name, department, graduationYear, bio } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (department) updateData.department = department;
    if (graduationYear) updateData.graduationYear = graduationYear;
    if (bio) updateData.bio = bio;
    
    // Ensure req.file is present for Cloudinary uploads
    if (req.file) {
        updateData.profilePic = req.file.path; // Multer-storage-cloudinary provides URL string in path
    }
    
    console.log("Updating profile for user ID:", req.user.id, "with data:", updateData);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true } // Add runValidators for better error catching
    );

    if (!user) {
      console.error("Profile update failed: User not found in DB with ID:", req.user.id);
      return res.status(404).json({ error: "User not found in database" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePic: user.profilePic,
        department: user.department,
        graduationYear: user.graduationYear,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error("CRITICAL: Update profile exception:", error);
    res.status(500).json({ 
      error: "Critical server error during profile update", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};

// GET PUBLIC PROFILE
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        profilePic: user.profilePic,
        department: user.department,
        bio: user.bio,
        sellerLevel: user.sellerLevel,
        averageRating: user.averageRating,
        totalReviews: user.totalReviews,
        completedSales: user.completedSales,
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET ALL USERS (ADMIN)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// BAN USER (ADMIN)
exports.banUser = async (req, res) => {
  try {
    const { userId, banReason } = req.body;

    // Verify admin is trying to ban
    const admin = await User.findById(req.user.id);
    if (admin.role !== "admin") {
      return res.status(403).json({ error: "Only admins can ban users" });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent banning admin accounts
    if (user.role === "admin") {
      return res.status(403).json({ error: "Cannot ban admin accounts" });
    }

    // Ban the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isBanned: true,
        banReason: banReason || "Banned by admin",
        bannedAt: new Date(),
      },
      { new: true }
    ).select("-password");

    res.json({
      message: "User banned successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Ban user error:", error);
    res.status(500).json({ error: "Failed to ban user" });
  }
};

// UNBAN USER (ADMIN)
exports.unbanUser = async (req, res) => {
  try {
    const { userId } = req.body;

    // Verify admin is trying to unban
    const admin = await User.findById(req.user.id);
    if (admin.role !== "admin") {
      return res.status(403).json({ error: "Only admins can unban users" });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Unban the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isBanned: false,
        banReason: null,
        bannedAt: null,
      },
      { new: true }
    ).select("-password");

    res.json({
      message: "User unbanned successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Unban user error:", error);
    res.status(500).json({ error: "Failed to unban user" });
  }
};

// DELETE USER (ADMIN)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    // Verify admin is trying to delete
    const admin = await User.findById(req.user.id);
    if (admin.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete users" });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent deleting admin accounts
    if (user.role === "admin") {
      return res.status(403).json({ error: "Cannot delete admin accounts" });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// 🔹 Fetch My Earnings Dashboard Data
exports.getMyEarnings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    // Fetch all delivered orders where user is the seller
    const Order = require("../models/Order");
    const deliveredSales = await Order.find({ sellerId: req.user.id, status: "Delivered" })
      .populate("itemId", "title image price")
      .populate("buyerId", "name profilePic")
      .sort({ updatedAt: -1 });

    res.json({
      sellerLevel: user.sellerLevel,
      totalEarnings: user.totalEarnings,
      completedSales: user.completedSales,
      averageRating: user.averageRating,
      totalReviews: user.totalReviews,
      history: deliveredSales
    });
  } catch (error) {
    console.error("Get my earnings error:", error);
    res.status(500).json({ error: "Failed to fetch earnings data" });
  }
};

// 🔹 Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect current password" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// 🔹 Delete Account
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect password" });

    await User.findByIdAndDelete(req.user.id);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
