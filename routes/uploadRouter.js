const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");
const pdfsUpload = require("../middlewares/pdfsMulterConfig");

router.post(
  "/createUpload",
  pdfsUpload.array("pdfs", 5),
  uploadController.createUpload
);

router.post("/getAllUploads", uploadController.getAllUploads);

router.get("/findAllUploads", uploadController.findAllUploads);

router.get("/findOneUploads/:id", uploadController.findOneUpload);

router.put(
  "/updateUpload/:id", // ✅ Upload ID URL se milega
  pdfsUpload.array("pdfs", 5), // ✅ Max 5 PDF files allowed
  uploadController.updateUploads // ✅ Controller function call
);

router.delete("/deleteUpload/:id", uploadController.deleteUploads);
router.delete("/deletePdfs/:uploadId/:pdfId", uploadController.deletePdfs);
module.exports = router;
