const jwt = require('jsonwebtoken');
const User = require("../models/userModel");




const authCheck = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.status !== "active") {
      let message = "Account is not active";

      if (user.status === "pending") {
        message = "Account approval pending";
      } else if (user.status === "inactive") {
        message = "Account is inactive";
      } else if (user.status === "blocked") {
        message = "Account has been blocked";
      }

      return res.status(403).json({ error: message });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};



const superAdminCheck = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Super Admin access only" });
  }
  next();
};



const permissionCheck = (permission) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role === "superadmin") {
      return next();
    }

    if (
      req.user.role === "admin" &&
      Array.isArray(req.user.permissions) &&
      req.user.permissions.includes(permission)
    ) {
      return next();
    }

    return res.status(403).json({ message: "Permission Denied" });
  };
};


module.exports = {authCheck, permissionCheck, superAdminCheck};

