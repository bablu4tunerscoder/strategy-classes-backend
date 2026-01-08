const express = require("express");
const router = express.Router();
const uploadController = require("../../controllers/uploadController");
const { authCheck } = require("../../middlewares/middleware");




router.post("/getAllUploads",authCheck, uploadController.getAllUploads);
router.get("/findOneUploads/:id",authCheck, uploadController.findOneUpload);



module.exports = router;
