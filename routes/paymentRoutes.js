const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/create-order", paymentController.createOrder);
router.post("/verify-payment", paymentController.verifyPayment);
router.post("/cancel-payment", paymentController.cancelPayment);
router.post("/paymentsUser/:userId", paymentController.paymetsByUser);
router.post("/uploaddedNotes", paymentController.uploaddedNotes);

// ✅ Route to get all users' purchase history
router.get("/all-purchases", paymentController.fetchAllUsersPurchaseHistory);
router.get("/revenue", paymentController.getRevenue);
module.exports = router;
