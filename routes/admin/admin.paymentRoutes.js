const express = require("express");
const router = express.Router();
const paymentController = require("../../controllers/paymentController");
const { authCheck, superAdminCheck , permissionCheck } = require("../../middlewares/middleware");


router.post("/create-order",authCheck, paymentController.createOrder);
router.post("/verify-payment", authCheck,paymentController.verifyPayment);
router.post("/cancel-payment",authCheck, paymentController.cancelPayment);
router.post("/payments-user/:userId",authCheck, paymentController.paymentsByUser);
router.post("/uploaddedNotes",authCheck, paymentController.uploadedNotes);

// ✅ Route to get all users' purchase history
router.get("/all-purchases", authCheck, superAdminCheck, paymentController.fetchAllUsersPurchaseHistory);
router.get("/revenue",authCheck, superAdminCheck,  paymentController.getRevenue);
module.exports = router;
