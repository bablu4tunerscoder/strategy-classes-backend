const express = require("express");
const router = express.Router();
const subjectController = require("../../controllers/subjectController");
const { authCheck,permissionCheck } = require("../../middlewares/middleware");


router.post("/addSubjects",authCheck,permissionCheck("subject"), subjectController.addSubjects);
router.get("/findAllSubjects", authCheck,permissionCheck("subject"),subjectController.findAllSubjects);
router.get("/findbyId/:subject_id", authCheck,permissionCheck("subject"),subjectController.findById);
router.delete("/deleteSubject/:subject_id",authCheck,permissionCheck("subject"), subjectController.deleteId);
router.put("/updateSubjects/:subject_id",authCheck,permissionCheck("subject"), subjectController.subjectUpdate);


module.exports = router;
