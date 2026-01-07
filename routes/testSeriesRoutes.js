const express = require("express");
const router = express.Router();

// Importing the controller functions
const {
  getQuizzes,
  createNewQuiz,
  getQuizByIdController,
  deleteQuizByIdController,
  updateQuiz,

  getSeriesWithSubjectId,
} = require("../controllers/testSeriesController");

const upload = require("../middlewares/multer-config");

// Route for getting all quizzes
router.get("/", getQuizzes);

// Route for creating a new quiz
router.post(
  "/addQuiz",
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  createNewQuiz
);

// Route for getting quizzes by id
router.get("/:id", getQuizByIdController);

// Route for deleting quizzes by id
router.delete("/:id", deleteQuizByIdController);

// Route for updating quizzes by id
router.put(
  "/:quiz_id",
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  updateQuiz
);

// get courses with subject id api
router.get("/seriesWithSubjectId/:id", getSeriesWithSubjectId);

module.exports = router;
