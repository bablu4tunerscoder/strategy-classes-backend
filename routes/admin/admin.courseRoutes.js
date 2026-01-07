const express = require("express");
const router = express.Router();
const courseController = require("../../controllers/courseController");
const upload = require("../../middlewares/multer-config");

router.post("/addCourse",
   upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "lectureFiles", maxCount: 10 },
  ]), courseController.addCourse);

router.get("/findAllCourses", courseController.findAllCourses);

router.get("/findOneCourses/:course_id", courseController.findOneID);

router.put(
  "/updateCourse/:course_id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "lectureFiles", maxCount: 10 },
  ]),
  courseController.courseUpdate
);

router.put(
  "/course_recommended_update/:course_id",
  courseController.updateCourseRecommendation
);

router.delete("/deleteCourse/:course_id", courseController.deleteCourses);


router.get(
  "/courseWithSubjectId/:subject_id",
  courseController.getCoursesWithSubjectId
);


router.post(
  "/add_lecture",
  upload.array("lectureFiles"),
  courseController.addLecture
);

// Update Only Lecture Route
router.put(
  "/update_lecture/:course_id",
  upload.single("lectureFile"), 
  courseController.updateLecture
);

// Delete Only Lecture Route
router.delete("/delete_lecture/:course_id/:lecture_id", courseController.deleteLectureById);



module.exports = router;
