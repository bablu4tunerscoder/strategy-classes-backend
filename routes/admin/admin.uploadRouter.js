const express = require("express");
const router = express.Router();
const uploadController = require("../../controllers/uploadController");
const pdfsUpload = require("../../middlewares/pdfsMulterConfig");
const { permissionCheck,authCheck } = require("../../middlewares/middleware");

router.post(
  "/createUpload",
  authCheck,permissionCheck("uploader"),
  pdfsUpload.array("pdfs", 5),
  uploadController.createUpload
);

router.post("/getAllUploads",authCheck,permissionCheck("uploader"), uploadController.getAllUploads);

router.get("/findOneUploads/:id",authCheck,permissionCheck("uploader"), uploadController.findOneUpload);

router.put(
  "/updateUpload/:id", authCheck,permissionCheck("uploader"),
  pdfsUpload.array("pdfs", 5), // ✅ Max 5 PDF files allowed
  uploadController.updateUploads // ✅ Controller function call
);

router.delete("/deleteUpload/:id",authCheck, permissionCheck("uploader"), uploadController.deleteUploads);
router.delete("/deletePdfs/:uploadId/:pdfId",authCheck, permissionCheck("uploader"), uploadController.deletePdfs);
module.exports = router;
