const express = require("express");
const router = express.Router();

// Importing the controller functions
const {
  getQuizzes,
  createNewQuiz,
  getQuizById,
  deleteQuizById,
  updateQuiz,
  getQuizWithCourseId,
} = require("../../controllers/quizController");

const upload = require("../../middlewares/multer-config");
const { authCheck,permissionCheck } = require("../../middlewares/middleware");

// Route for getting all quizzes
router.get("/", authCheck,getQuizzes);

// Route for creating a new quiz
router.post(
  "/addQuiz",authCheck,permissionCheck("quiz"),
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  createNewQuiz
);

// Route for getting quizzes by id
router.get("/:id",authCheck,permissionCheck("quiz"), getQuizById);

// Route for deleting quizzes by id
router.delete("/:id", authCheck,permissionCheck("quiz"),deleteQuizById);

// Route for updating quizzes by id
router.put(
  "/:quiz_id",authCheck,permissionCheck("quiz"),
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  updateQuiz
);

// get courses with subject id api
router.get("/quizWithCourseId/:course_id", authCheck,permissionCheck("quiz"),getQuizWithCourseId);

module.exports = router;
