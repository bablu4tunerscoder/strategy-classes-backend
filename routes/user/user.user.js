const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const { authCheck } = require("../../middlewares/middleware");
const upload = require("../../middlewares/multer");
const { requestContactChange, verifyContactChange } = require("../../controllers/ContactChangeControler");



router.delete("/:userId", authCheck, userController.deleteUser);

router.post(
  "/upload-profile-image",
  upload.single("profileImage"),
  authCheck,
  userController.uploadProfileImage
);

// Route to store quiz attempt
router.post("/store-attempt", userController.storeQuizAttempt);

// Route to get a specific user by userId
router.get("/:userId", userController.getUser);

// Route to get a specific user overall rank
router.get("/rank/:userId", userController.getUserRank);

// Route to get ranking of user in a specific quiz
router.get(
  "/quiz/:quiz_id/user/:userId/rank",
  userController.fetchUserQuizRank
);

router.post("/contact-change/request", authCheck, requestContactChange);
router.post("/contact-change/verify", authCheck, verifyContactChange);

module.exports = router;
