const router = require("express").Router();
const { registerUser, loginUser, updateProfile, getPublicProfile } = require("../controllers/authController");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");

router.post("/register", upload.single("profilePic"), registerUser);
router.post("/login", loginUser);
router.put("/update-profile", auth, upload.single("profilePic"), updateProfile);
router.get("/profile/:id", getPublicProfile);

module.exports = router;