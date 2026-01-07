const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const upload = require("../middlewares/multer-config");

router.get("/findAllCourses", courseController.findAllCourses);
router.get("/findOneCourses/:course_id", courseController.findOneID);
router.get(
  "/courseWithSubjectId/:subject_id",
  courseController.getCoursesWithSubjectId
);


module.exports = router;
