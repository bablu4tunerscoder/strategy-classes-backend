const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const upload = require("../middlewares/multer-config");

router.post("/addCourses", courseController.addCourses);
router.post(
  "/multerUploadCourse",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "lectureFiles", maxCount: 10 },
  ]),
  courseController.addCourses_multer
);
router.get("/findAllCourses", courseController.findAllCourses);
router.get("/findOneCourses/:course_id", courseController.findOneID);
router.put(
  "/multerUpdateCourse/:course_id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "lectureFiles", maxCount: 10 },
  ]),
  courseController.courseUpdate
);

router.delete("/deleteCourse/:course_id", courseController.deleteCourses);

// get courses with subject id api
router.get(
  "/courseWithSubjectId/:subject_id",
  courseController.getCoursesWithSubjectId
);
// / Get Courses With Subject Details
router.post("/getCourses", courseController.getCourses);

router.put(
  "/course_recommended/:course_id",
  courseController.updateCourseRecommendation
);

// Add Only Lecture Route
router.post(
  "/add_lecture",
  upload.array("lectureFiles"),
  courseController.addLecture
);

router.put(
  "/update_lecture/:course_id",
  upload.single("lectureFile"), // Handling single file upload for updates
  courseController.updateLecture
);

// Delete Only Lecture Route
router.delete("/:course_id/:lecture_id", courseController.deleteLectureById);

//Get Subject By Course_id Route
router.get("/getSubjectName/:course_id", courseController.getSubjectByCourseId);

module.exports = router;
