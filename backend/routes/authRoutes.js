const router = require("express").Router();
const { registerUser, loginUser, updateProfile, getPublicProfile, getAllUsers, banUser, unbanUser, deleteUser, changePassword, deleteAccount } = require("../controllers/authController");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const User = require("../models/User");

router.post("/register", upload.single("profilePic"), registerUser);
router.post("/login", loginUser);
router.put("/update-profile", auth, (req, res, next) => {
  upload.single("profilePic")(req, res, (err) => {
    if (err) {
      console.error("Multer/Cloudinary upload error:", err);
      return res.status(400).json({ error: "Image upload failed", details: err.message || err });
    }
    next();
  });
}, updateProfile);
router.get("/profile/:id", getPublicProfile);
router.get("/my-earnings", auth, require("../controllers/authController").getMyEarnings);
router.get("/admin/users", auth, admin, getAllUsers);
router.put("/admin/ban", auth, admin, banUser);
router.put("/admin/unban", auth, admin, unbanUser);
router.delete("/admin/user/:id", auth, admin, deleteUser);

// Account Settings
router.post("/change-password", auth, changePassword);
router.delete("/delete-account", auth, deleteAccount);

// Get first admin user id for support messaging
router.get("/admin-id", auth, async (req, res) => {
  try {
    const adminUser = await User.findOne({ role: "admin" }).select("_id name email");
    if (!adminUser) return res.status(404).json({ error: "Admin not found" });
    res.json(adminUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admin" });
  }
});

module.exports = router;