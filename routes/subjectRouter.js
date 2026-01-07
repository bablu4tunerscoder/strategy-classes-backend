const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subjectController");
router.post("/addSubjects", subjectController.addSubjects);
router.get("/findAllSubjects", subjectController.findAllSubjects);
router.get("/findbyId/:subject_id", subjectController.findById);
router.delete("/deleteSubject/:subject_id", subjectController.deleteId);
router.put("/updateSubjects/:subject_id", subjectController.subjectUpdate);
module.exports = router;
