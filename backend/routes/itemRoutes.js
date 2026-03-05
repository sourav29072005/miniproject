const router = require("express").Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../middleware/upload");

const {
  addItem,
  getItems,
  getUserItems,
  getPendingItems,
  approveItem,
  deleteItem,
  markSold,
  updateItem
} = require("../controllers/itemController");

router.put("/sold/:id", auth, markSold);
router.put("/:id", auth, updateItem);
router.post("/", auth, upload.single("image"), addItem);
router.get("/", getItems);
router.get("/my", auth, getUserItems);
router.get("/pending", auth, admin, getPendingItems);
router.put("/approve/:id", auth, admin, approveItem);
router.delete("/:id", auth, deleteItem);


module.exports = router;