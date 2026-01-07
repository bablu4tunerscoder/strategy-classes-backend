const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Routes
router.post("/register", authController.register);
router.post("/user-verify", authController.verifyUser);
router.post("/resend-verification-otp", authController.resendVerificationOTP);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
