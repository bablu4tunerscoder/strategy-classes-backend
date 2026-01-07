const express = require("express");
const {
  getAllQuestions,
  createQuestions,
  deleteById,
  updateQuestionById,
  getQuestionsByQuizId,
} = require("../controllers/tseriesQuestionController");

const router = express.Router();

// Create a new quiz
router.post("/", createQuestions);

// Get all quizzes
router.get("/", getAllQuestions);

// Update quiz by ID
router.put("/:id", updateQuestionById);

// Delete quiz by ID
router.delete("/:id", deleteById);

// get questions with Tseries_id api
router.get("/questionsWithSeriesId/:series_id", getQuestionsByQuizId);

module.exports = router;
