const express = require("express");
const router = express.Router();

// Importing the controller functions
const {
  getQuizzes,
  getQuizById,
  getQuizWithCourseId,
} = require("../controllers/quizController");


router.get("/", getQuizzes);
router.get("/:id", getQuizById);
router.get("/quizWithCourseId/:course_id", getQuizWithCourseId);

module.exports = router;
