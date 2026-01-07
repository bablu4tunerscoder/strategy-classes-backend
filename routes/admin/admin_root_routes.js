const express = require("express");
const router = express.Router();

const adminUserRoutes = require("./admin.userRoutes");
const adminRoleRoutes = require("./admin.role&permissionsRoutes");
const adminBlogRoutes = require("./admin.blogRoutes");
const adminCourseRoutes = require("./admin.courseRoutes");

router.use("/users", adminUserRoutes);
router.use("/roles", adminRoleRoutes);
router.use("/blogs", adminBlogRoutes);
router.use("/course", adminCourseRoutes);

module.exports = router;
