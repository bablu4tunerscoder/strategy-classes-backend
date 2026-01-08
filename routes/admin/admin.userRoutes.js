const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");
const { authCheck, permissionCheck } = require("../../middlewares/middleware");


// Routes

router.get("/users",authCheck, permissionCheck('user'),  userController.getAllUsers);
router.get("/:userId",authCheck, permissionCheck('user'), userController.getUserById);
router.delete("/:userId", authCheck, permissionCheck('user'), userController.deleteUser);
router.delete("/:userId", authCheck, permissionCheck('user'), userController.getUserRank);


module.exports = router;
