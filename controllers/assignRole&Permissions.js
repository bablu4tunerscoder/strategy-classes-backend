const User = require("../models/userModel");

const assignUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    // 🔹 Basic validation
    if (!userId || !role) {
      return res.status(400).json({
        error: "userId and role are required",
      });
    }

    // 🔒 Only allow user <-> admin
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        error: "Only user or admin role can be assigned",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ❌ superadmin ko touch nahi karna
    if (user.role === "superadmin") {
      return res.status(403).json({
        error: "Superadmin role cannot be modified",
      });
    }

    // 🔁 Role change (user <-> admin)
    user.role = role;

    // 🔥 IMPORTANT: dono cases me permissions empty
    user.permissions = [];

    await user.save();

    res.json({
      message: "Role updated successfully",
      data: {
        userId: user._id,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAdminPermissions = async (req, res) => {
  try {
    const { userId, permissions } = req.body;

  
    if (!userId || !Array.isArray(permissions)) {
      return res.status(400).json({
        error: "userId and permissions array are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔒 Sirf admin ke liye
    if (user.role !== "admin") {
      return res.status(403).json({
        error: "Permissions can be updated only for admin users",
      });
    }

    // 🔥 Direct overwrite (add + remove both handled)
    user.permissions = [...new Set(permissions)];

    await user.save();

    res.json({
      message: "Admin permissions updated successfully",
      data: {
        userId: user._id,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find(
      { role: { $in: ["admin", "superadmin"] } },
      {
        password: 0,
        otp: 0,
        otpExpires: 0,
      }
    ).sort({ createdAt: -1 });

    res.json({
      message: "Admin users fetched successfully",
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = {assignUserRole, updateAdminPermissions, getAdminUsers};
