const multer = require("multer");
const path = require("path");
const fs = require("fs");

// PDFs Uploads Directory Setup
const PDF_UPLOADS_DIR = path.join(__dirname, "../uploads/pdfs");
if (!fs.existsSync(PDF_UPLOADS_DIR))
  fs.mkdirSync(PDF_UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PDF_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"));
    }
  },
});

module.exports = upload;
