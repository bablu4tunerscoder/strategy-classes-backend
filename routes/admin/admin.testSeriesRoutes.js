const express = require("express");
const router = express.Router();

// Importing the controller functions
const {
  getQuizzes,
  createNewQuiz,
  getQuizById,
  deleteQuizById,
  updateQuiz,
  getSeriesWithSubjectId,
} = require("../../controllers/testSeriesController");

const upload = require("../../middlewares/multer-config");
const { authCheck, permissionCheck} = require("../../middlewares/middleware");


router.get("/", getQuizzes);

// Route for creating a new quiz
router.post(
  "/addQuiz",authCheck,permissionCheck("test-series"),
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  createNewQuiz
);

// Route for getting quizzes by id
router.get("/:id",authCheck,permissionCheck("test-series"), getQuizById);

// Route for deleting quizzes by id
router.delete("/:id",authCheck,permissionCheck("test-series"), deleteQuizById);

// Route for updating quizzes by id
router.put(
  "/:quiz_id",authCheck,permissionCheck("test-series"),
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  updateQuiz
);

// get courses with subject id api
router.get("/seriesWithSubjectId/:id",authCheck,permissionCheck("test-series"), getSeriesWithSubjectId);

module.exports = router;
