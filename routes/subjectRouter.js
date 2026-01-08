const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subjectController");


router.get("/findAllSubjects", subjectController.findAllSubjects);
router.get("/findbyId/:subject_id", subjectController.findById);

module.exports = router;
