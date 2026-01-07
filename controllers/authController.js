const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateOTP } = require("../helpers/common");
const { transporter } = require("../config/nodemailer");


// Register
const register = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, interestedCourses } = req.body;

    if (!Array.isArray(interestedCourses)) {
      return res.status(400).json({
        error: "Interested courses must be an array",
      });
    }

    // 🔍 Find existing user (email OR phone)
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔢 Generate OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 5 * 60 * 1000;

    // ✅ CASE 1: User exists & ACTIVE → block
    if (existingUser && existingUser.status === "active") {
      return res.status(400).json({
        error: "Email or phone number already registered",
      });
    }

  
   if (existingUser && existingUser.status === "pending") {
      await User.deleteOne({ _id: existingUser._id });
    }

    
    const lastUser = await User.findOne().sort({ userId: -1 }).select("userId");
    const newUserId = lastUser ? Number(lastUser.userId) + 1 : 1;

    // ✅ CASE 3: New user → CREATE
    await User.create({
      userId: newUserId,
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      interestedCourses,
      role: "user",
      status: "pending",
      otp,
      otpExpires,
    });

    // 📧 Send OTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email - OTP",
      text: `Your email verification OTP is ${otp}. It is valid for 5 minutes.`,
    };

    // await transporter.sendMail(mailOptions);

    return res.status(201).json({
      message: "User registered successfully. OTP sent for verification.",
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};


const verifyUser = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 🔹 Basic validation
    if (!email || !otp) {
      return res.status(400).json({
        error: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // 🔹 Already verified
    if (user.status === "active") {
      return res.status(400).json({
        error: "User already verified",
      });
    }

    // 🔹 Only pending users can be verified
    if (user.status !== "pending") {
      return res.status(400).json({
        error: "User is not eligible for verification",
      });
    }

    // 🔐 OTP validation
    if (
      user.otp !== otp ||
      !user.otpExpires ||
      user.otpExpires < Date.now()
    ) {
      return res.status(400).json({
        error: "Invalid or expired OTP",
      });
    }

    // ✅ Verify user
    user.status = "active";
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully",
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

const resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // 🔹 Validation
    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // 🔹 Already verified
    if (user.status === "active") {
      return res.status(400).json({
        error: "User already verified",
      });
    }

    // 🔹 Only pending users can request resend
    if (user.status !== "pending") {
      return res.status(400).json({
        error: "User is not eligible for OTP resend",
      });
    }

    // 🔄 Generate NEW OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // 📧 Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Resend Email Verification OTP",
      text: `Your email verification OTP is ${otp}. It is valid for 5 minutes.`,
    };

    // await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "Verification OTP resent successfully to email",
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;

    const user = await User.findOne({
      $or: [
        email ? { email } : null,
        phoneNumber ? { phoneNumber } : null,
      ].filter(Boolean), 
    }).select("-otp -otpExpires");

    if (!user) {
      return res.status(400).json({ error: "Invalid email/phone or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email/phone or password" });
    }

    if (user && user.status !== "active") {
      return res.status(400).json({
        error: "User is not verified",
      });
    }


    const payload = {
      userid: user._id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      data: { user },
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Forgot Password (Send OTP)
const forgotPassword = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({
        error: "Email or phone number is required",
      });
    }

    const user = await User.findOne({
      $or: [
        email ? { email } : null,
        phoneNumber ? { phoneNumber } : null,
      ].filter(Boolean),
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const otp = generateOTP();
    const otpExpires = Date.now() + 5 * 60 * 1000; 

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // 🔹 Email se OTP
    if (email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is ${otp}. It is valid for 5 minutes.`,
      };

      // await transporter.sendMail(mailOptions);
    }

    // 🔹 Phone se OTP (SMS API integration yahan)
    if (phoneNumber) {
      /*
        Example:
        await sendSMS(
          user.phoneNumber,
          `Your password reset OTP is ${otp}. Valid for 5 minutes.`
        );
      */
    }

    res.status(200).json({
      message: `OTP sent successfully via ${email ? "email" : phoneNumber ? "Phone Number" : ""}`,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔹 Reset Password (Verify OTP & Update Password)
const resetPassword = async (req, res) => {
  try {
    const { email, phoneNumber, otp, newPassword } = req.body;

    // ✅ Basic validation
    if ((!email && !phoneNumber) || !otp || !newPassword) {
      return res.status(400).json({
        error: "Email or phone number, OTP and new password are required",
      });
    }

    // ✅ Find user by email OR phone
    const user = await User.findOne({
      $or: [
        email ? { email } : null,
        phoneNumber ? { phoneNumber } : null,
      ].filter(Boolean),
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ OTP validation
    if (
      user.otp !== otp ||
      !user.otpExpires ||
      user.otpExpires < Date.now()
    ) {
      return res.status(400).json({
        error: "Invalid or expired OTP",
      });
    }

    // 🔐 Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // 🧹 Clear OTP fields
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.status(200).json({
      message: "Password successfully reset",
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  verifyUser,
  forgotPassword,
  resendVerificationOTP,
  resetPassword,
  
};

