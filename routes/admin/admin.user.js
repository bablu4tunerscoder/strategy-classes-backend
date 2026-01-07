const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const { authCheck } = require("../../middlewares/middleware");
const { requestContactChange, verifyContactChange } = require("../../controllers/ContactChangeControler");

// Routes

router.get("/users",authCheck,  userController.getAllUsers);
router.delete("/:userId", authCheck, userController.deleteUser);
router.get("/:userId",authCheck, userController.getUser);


module.exports = router;
