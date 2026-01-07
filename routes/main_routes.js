const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const blogRoutes = require("./blogRoutes");
const courseRoutes = require("./blogRoutes");


router.use("/auth", authRoutes);
router.use("/blogs", blogRoutes);
router.use("/course", courseRoutes);


module.exports = router;