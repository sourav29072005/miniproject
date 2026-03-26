const multer = require("multer");
const path = require("path");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// REPLACED STORAGE (Cloudinary instead of diskStorage)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "cevconnect",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 800, height: 800, crop: "limit" },
      { quality: "auto" }
    ],
  },
});

// File type validation (only images) ✅ (UNCHANGED)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpg|jpeg|png|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG, WEBP images allowed!"));
  }
};

// Multer config ✅ (UNCHANGED except storage)
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

module.exports = upload;