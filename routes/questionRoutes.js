const express = require("express");
const {
  getAllQuestions,
  getQuestionsByQuizId,
} = require("../controllers/questionController");

const router = express.Router();

// Get all quizzes
router.get("/", getAllQuestions);

// get questions with quiz_id api
router.get("/questionsWithQuizId/:quiz_id", getQuestionsByQuizId);

module.exports = router;
