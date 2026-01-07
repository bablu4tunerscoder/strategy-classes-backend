const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const { authCheck } = require("../../middlewares/middleware");
const upload = require("../../middlewares/multer");
const { requestContactChange, verifyContactChange } = require("../../controllers/ContactChangeControler");




router.post(
  "/user-profile",
  authCheck,
  userController.getMyProfile
);

router.post(
  "/upload-profile-image",
  upload.single("profileImage"),
  authCheck,
  userController.uploadMyProfileImage
);

// Route to store quiz attempt
router.post("/store-quiz-attempt",authCheck, userController.storeQuizAttempt);


// Route to get a specific user overall rank
router.get("/my-rank",authCheck, userController.getMyRank);


router.post("/contact-change/request", authCheck, requestContactChange);
router.post("/contact-change/verify", authCheck, verifyContactChange);

module.exports = router;
