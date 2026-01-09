const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const blogRoutes = require("./blogRoutes");
const courseRoutes = require("./blogRoutes");
const questionRoutes = require("./questionRoutes");
const quizRoutes = require("./quizRoutes");
const subjectRouter = require("./subjectRouter");
const testSeriesProgress = require("./testSeriesProgressRoute");
const testSeriesQuestion = require("./testSeriesQuestionRoutes");
const testSeries = require("./testSeriesRoutes");
const youtubeRoutes = require("./youtubeRoutes");


router.use("/auth", authRoutes);
router.use("/blogs", blogRoutes);
router.use("/course", courseRoutes);
router.use("/question", questionRoutes);
router.use("/quiz", quizRoutes);
router.use("/subject", subjectRouter);
router.use("/test-series-progress", testSeriesProgress);
router.use("/test-series-question", testSeriesQuestion);
router.use("/test-series", testSeries);

router.use("/youtube", youtubeRoutes);



module.exports = router;