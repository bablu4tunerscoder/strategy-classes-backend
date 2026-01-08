const express = require("express");
const router = express.Router();

// Importing the controller functions
const {
  getQuizzes,
  getQuizById,
  getSeriesWithSubjectId,
} = require("../controllers/testSeriesController");

const upload = require("../middlewares/multer-config");

// Route for getting all quizzes
router.get("/", getQuizzes);



// Route for getting quizzes by id
router.get("/:id", getQuizById);

// get courses with subject id api
router.get("/seriesWithSubjectId/:id", getSeriesWithSubjectId);

module.exports = router;
