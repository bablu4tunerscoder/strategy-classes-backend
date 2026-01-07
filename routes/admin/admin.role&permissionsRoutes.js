const express = require("express");
const router = express.Router();

const {
  assignUserRole,
  updateAdminPermissions,
  getAdminUsers
} = require("../../controllers/assignRole&Permissions");
const { authCheck, superAdminCheck } = require("../../middlewares/middleware");

router.put(
  "/assign-role",
  authCheck,
  superAdminCheck,
  assignUserRole
);


router.put(
  "/update-permissions",
  authCheck,
  superAdminCheck,
  updateAdminPermissions
);


router.get(
  "/admins",
  authCheck,
  superAdminCheck,
  getAdminUsers
);

module.exports = router;
