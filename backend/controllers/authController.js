const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// REGISTER
exports.registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const profilePic = req.file ? req.file.filename : null;

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
    const { name, department, graduationYear, bio } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (department) updateData.department = department;
    if (graduationYear) updateData.graduationYear = graduationYear;
    if (bio) updateData.bio = bio;
    if (req.file) updateData.profilePic = req.file.filename;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    );

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
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
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
        email: user.email,
        profilePic: user.profilePic,
        department: user.department,
        bio: user.bio,
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
