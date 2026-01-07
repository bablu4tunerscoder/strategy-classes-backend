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
    fileSize: 50 * 1024 * 1024, 
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

// const multer = require("multer");
// const { v2: cloudinary } = require("cloudinary");
// const fs = require("fs");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");

// const upload1 = require("../middlewares/multer-config");
// dotenv.config(); // Load environment variables
// const dotenv = require("dotenv");

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });


// Multer Storage Configuration for Cloudinary
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: async (req, file) => {
//     let folder = "courses";
//     let resource_type = "image";

//     // Handle video uploads for lecture files
//     if (file.mimetype.startsWith("video/")) {
//       resource_type = "video";
//     }

//     // Handle images for thumbnails
//     if (file.mimetype.startsWith("image/")) {
//       resource_type = "image";
//     }

//     return {
//       folder: folder,
//       resource_type: resource_type,
//       allowed_formats: ["jpg", "png", "pdf", "mp4", "avi", "mov"],
//     };
//   },
// });

// Multer Upload Configuration
// const upload = multer({ storage });