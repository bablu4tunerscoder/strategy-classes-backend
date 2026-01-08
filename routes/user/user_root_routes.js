const express = require("express");
const router = express.Router();

const userRoutes = require("./user.userRoutes");
const paymentRoutes = require("./user.paymentRoutes");
const uploadRouter = require("./user.uploadRouter");

router.use("/", userRoutes);
router.use("/payments", paymentRoutes);
router.use("/uploader", uploadRouter);


module.exports = router;