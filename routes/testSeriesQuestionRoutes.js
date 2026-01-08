const express = require("express");
const {
  getAllQuestions,
  getQuestionsByTestSeries,
} = require("../controllers/testSeriesQuestionController");

const router = express.Router();



// Get all quizzes
router.get("/", getAllQuestions);

// get questions with Tseries_id api
router.get("/questionsWithSeriesId/:series_id", getQuestionsByTestSeries);

module.exports = router;
