const express = require("express");
const router = express.Router();

const adminUserRoutes = require("./admin.userRoutes");
const adminRoleRoutes = require("./admin.role&permissionsRoutes");
const adminBlogRoutes = require("./admin.blogRoutes");
const adminQuestionRoutes = require("./admin.questionRoutes");
const adminQuizRoutes = require("./admin.quizRoutes");
const adminSubjectRoutes = require("./admin.subjectRouter");
const adminCourseRoutes = require("./admin.courseRoutes");
const testSeriesProgress = require("./admin.testSeriesProgressRoute");
const testSeriesQuestion = require("./admin.testSeriesQuestionRoutes");
const testSeries = require("./admin.testSeriesRoutes");
const uploadRouter = require("./admin.uploadRouter");
const youtubeRoutes = require("./admin.youtubeRoutes");
const paymentRoutes = require("./admin.paymentRoutes");





router.use("/users", adminUserRoutes);
router.use("/roles", adminRoleRoutes);
router.use("/blogs", adminBlogRoutes);
router.use("/question", adminQuestionRoutes);
router.use("/quiz", adminQuizRoutes);
router.use("/subject", adminSubjectRoutes);
router.use("/course", adminCourseRoutes);
router.use("/test-series-progress", testSeriesProgress);
router.use("/test-series-question", testSeriesQuestion);
router.use("/test-series", testSeries);
router.use("/uploader", uploadRouter);
router.use("/youtube", youtubeRoutes);
router.use("/payment", paymentRoutes);


module.exports = router;
