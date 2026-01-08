const express = require("express");
const router = express.Router();
const courseController = require("../../controllers/courseController");
const upload = require("../../middlewares/multer-config");
const { authCheck,permissionCheck } = require("../../middlewares/middleware");


router.post("/addCourse",authCheck,permissionCheck("course"),
   upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "lectureFiles", maxCount: 10 },
  ]), courseController.addCourse);

router.get("/findAllCourses",authCheck,permissionCheck("course"), courseController.findAllCourses);

router.get("/findOneCourses/:course_id",authCheck,permissionCheck("course"), courseController.findOneID);

router.put(
  "/updateCourse/:course_id",authCheck, permissionCheck("course"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "lectureFiles", maxCount: 10 },
  ]),
  courseController.courseUpdate
);

router.put(
  "/course_recommended_update/:course_id",authCheck, permissionCheck("course"),
  courseController.updateCourseRecommendation
);

router.delete("/deleteCourse/:course_id", authCheck,permissionCheck("course"), courseController.deleteCourses);


router.get(
  "/courseWithSubjectId/:subject_id",authCheck,permissionCheck("course"),
  courseController.getCoursesWithSubjectId
);


router.post(
  "/add_lecture",authCheck,permissionCheck("course"),
  upload.array("lectureFiles"),
  courseController.addLecture
);

// Update Only Lecture Route
router.put(
  "/update_lecture/:course_id",authCheck,permissionCheck("course"),
  upload.single("lectureFile"), 
  courseController.updateLecture
);

// Delete Only Lecture Route
router.delete("/delete_lecture/:course_id/:lecture_id",authCheck, permissionCheck("course"), courseController.deleteLectureById);



module.exports = router;
