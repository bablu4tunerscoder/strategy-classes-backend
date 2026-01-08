const express = require("express");
const router = express.Router();
const paymentController = require("../../controllers/paymentController");
const { authCheck } = require("../../middlewares/middleware");

router.post("/create-order",authCheck, paymentController.createOrder);
router.post("/verify-payment",authCheck, paymentController.verifyPayment);
router.post("/cancel-payment", authCheck,paymentController.cancelPayment);
router.post("/payments-user/:userId",authCheck, paymentController.paymentsByUser);
router.post("/uploaddedNotes",authCheck, paymentController.uploadedNotes);


module.exports = router;
