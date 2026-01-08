const express = require("express");
const {
  getAllQuestions,
  createQuestions,
  deleteById,
  updateQuestionById,
  getQuestionsByQuizId,
} = require("../../controllers/questionController");
const { authCheck,permissionCheck } = require("../../middlewares/middleware");

const router = express.Router();

// Create a new quiz
router.post("/create",authCheck,permissionCheck("question"), createQuestions);

// Get all quizzes
router.get("/get-all",authCheck,permissionCheck("question"), getAllQuestions);

// Update quiz by ID
router.put("/:id", authCheck,permissionCheck("question"),updateQuestionById);

// Delete quiz by ID
router.delete("/:id",authCheck,permissionCheck("question"), deleteById);

// get questions with quiz_id api
router.get("/questionsWithQuizId/:quiz_id",authCheck,permissionCheck("question"), getQuestionsByQuizId);

module.exports = router;
