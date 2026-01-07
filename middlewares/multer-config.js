const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create upload directories if they don't exist
const UPLOADS_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, path.join(UPLOADS_DIR, "images"));
    } else if (file.mimetype === "application/pdf") {
      cb(null, path.join(UPLOADS_DIR, "pdfs"));
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, path.join(UPLOADS_DIR, "videos"));
    } else {
      cb(new Error("Unsupported file type"), false);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // Limit file size to 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/", "application/pdf", "video/"];
    if (allowedMimeTypes.some((type) => file.mimetype.startsWith(type))) {
      cb(null, true);
    } else {
      cb(new Error("Only images, PDFs, and videos are allowed!"));
    }
  },
});

module.exports = upload;
