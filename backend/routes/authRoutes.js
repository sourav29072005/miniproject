const router = require("express").Router();
const { registerUser, loginUser, updateProfile, getPublicProfile, getAllUsers, banUser, unbanUser, deleteUser } = require("../controllers/authController");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.post("/register", upload.single("profilePic"), registerUser);
router.post("/login", loginUser);
router.put("/update-profile", auth, upload.single("profilePic"), updateProfile);
router.get("/profile/:id", getPublicProfile);
router.get("/my-earnings", auth, require("../controllers/authController").getMyEarnings);
router.get("/admin/users", auth, admin, getAllUsers);
router.put("/admin/ban", auth, admin, banUser);
router.put("/admin/unban", auth, admin, unbanUser);
router.delete("/admin/user/:id", auth, admin, deleteUser);

module.exports = router;