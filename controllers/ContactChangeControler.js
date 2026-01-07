const { generateOTP } = require("../helpers/common");
const ContactChangeRequest = require("../models/contactChangeModel");
const User = require("../models/userModel");

const requestContactChange = async (req, res) => {
  try {
    const { type, newValue } = req.body;
    const user = req.user;

    if (!["email", "phoneNumber"].includes(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }

    if (!newValue) {
      return res.status(400).json({ error: "New value is required" });
    }

    // Duplicate check
    const exists = await User.findOne({
      [type === "email" ? "email" : "phoneNumber"]: newValue,
    });

    if (exists) {
      return res.status(409).json({ error: `${type} already in use` });
    }

    await ContactChangeRequest.deleteMany({ userId: user._id, type });

    // Create new request
    await ContactChangeRequest.create({
      userId: user._id,
      type,
      newValue,
    });

    // OTP generate
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    
    if (type === "email") {
      // sendEmail(newValue, otp);
    } else if(type === "phoneNumber") {
      // sendSMS(newValue, otp);
    }

    res.json({ message: "OTP sent for verification" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const verifyContactChange = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = req.user;

    if (!otp) {
      return res.status(400).json({ error: "OTP is required" });
    }

    if (
      user.otp !== otp ||
      !user.otpExpires ||
      user.otpExpires < Date.now()
    ) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const request = await ContactChangeRequest.findOne({
      userId: user._id,
    });

    if (!request) {
      return res.status(404).json({ error: "No pending request found" });
    }

    // Apply change
    if (request.type === "email") {
      user.email = request.newValue;
    } else if (request.type === "phoneNumber") {
      user.phoneNumber = request.newValue;
    }

    // Clear OTP
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Delete request
    await ContactChangeRequest.deleteOne({ _id: request._id });

    res.json({ message: "Contact updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  requestContactChange,
  verifyContactChange,
};