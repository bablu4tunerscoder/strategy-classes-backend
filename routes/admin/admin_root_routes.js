const express = require("express");
const router = express.Router();

const adminUserRoutes = require("./admin.user");
const adminRoleRoutes = require("./admin.assignRole&Permissions");

router.use("/users", adminUserRoutes);
router.use("/roles", adminRoleRoutes);

module.exports = router;
