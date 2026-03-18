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
  rejectItem,
  deleteItem,
  markSold,
  updateItem,
  getItemById,
  getItemsByUser
} = require("../controllers/itemController");


router.post("/", auth, upload.array("images", 5), addItem);
router.get("/", getItems);
router.get("/my", auth, getUserItems);
router.get("/pending", auth, admin, getPendingItems);
router.get("/user/:userId", getItemsByUser);
router.get("/:id", getItemById);
router.put("/approve/:id", auth, admin, approveItem);
router.put("/reject/:id", auth, admin, rejectItem);
router.put("/:id", auth, updateItem);
router.delete("/:id", auth, deleteItem);


module.exports = router;