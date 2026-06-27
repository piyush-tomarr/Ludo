const multer = require("multer");
const { badRequest } = require("../utils/http");

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
    return cb(badRequest("Only JPG, PNG, and WEBP avatar images are allowed"));
  }

  cb(null, true);
};

// Avatars are resized by Sharp in the controller, so memory storage avoids
// temporary files and keeps the upload flow easy to reason about.
module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_AVATAR_SIZE_BYTES
  }
});
