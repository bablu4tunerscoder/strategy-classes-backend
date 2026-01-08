const express = require("express");
const {
  getAllQuestions,
  createQuestion,
  deleteQuestionById,
  updateQuestionById,
  getQuestionsByTestSeries,
} = require("../../controllers/testSeriesQuestionController");
const { authCheck,permissionCheck } = require("../../middlewares/middleware");

const router = express.Router();

// Create a new quiz
router.post("/",authCheck,permissionCheck("test-series"), createQuestion);

// Get all quizzes
router.get("/",authCheck,permissionCheck("test-series"), getAllQuestions);

// Update quiz by ID
router.put("/:id", authCheck,permissionCheck("test-series"),updateQuestionById);

// Delete quiz by ID
router.delete("/:id", authCheck,permissionCheck("test-series"),deleteQuestionById);

// get questions with Tseries_id api
router.get("/questionsWithSeriesId/:series_id",authCheck,permissionCheck("test-series"), getQuestionsByTestSeries);

module.exports = router;
