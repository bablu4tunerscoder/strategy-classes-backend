const express = require("express");
const {
  getAllQuestions,
  createQuestions,
  deleteById,
  updateQuestionById,
  getQuestionsByQuizId,
} = require("../../controllers/questionController");

const router = express.Router();

// Create a new quiz
router.post("/create", createQuestions);

// Get all quizzes
router.get("/get-all", getAllQuestions);

// Update quiz by ID
router.put("/:id", updateQuestionById);

// Delete quiz by ID
router.delete("/:id", deleteById);

// get questions with quiz_id api
router.get("/questionsWithQuizId/:quiz_id", getQuestionsByQuizId);

module.exports = router;
