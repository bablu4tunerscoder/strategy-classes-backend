const User = require("../models/userModel");
const Image = require("../models/imageModel");
const mongoose = require("mongoose");


// ✅ Logged-in user profile
const getMyProfile = async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password -otp -otpExpires");

  res.json({ success: true, data: user });
};

// ✅ Upload own profile image
const uploadMyProfileImage = async (req, res) => {
  const imageUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;

  const image = await Image.create({
    userId: req.user._id,
    url: imageUrl,
  });

  req.user.profileImage = image._id;
  await req.user.save();

  res.status(201).json({
    success: true,
    message: "Profile image uploaded",
    data: image,
  });
};

// ✅ Store quiz attempt (self only)
const storeQuizAttempt = async (req, res) => {
  const user = await User.findById(req.user._id);

  user.quizAttempted.push({
    ...req.body,
    attemptDate: new Date(),
  });

  await user.save();

  res.json({ success: true, message: "Quiz stored" });
};

// ✅ My overall rank
const getMyRank = async (req, res) => {
  const rankedUsers = await User.aggregate([
    { $addFields: { totalScore: { $sum: "$quizAttempted.score" } } },
    { $sort: { totalScore: -1 } },
    { $project: { _id: 1 } },
  ]);

  const rank =
    rankedUsers.findIndex(u => u._id.toString() === req.user._id.toString()) + 1;

  res.json({ success: true, rank });
};


// (ADMIN ONLY)

// ✅ Get all users 
const getAllUsers = async (req, res) => {
  const users = await User.find()
    .select("-password -otp -otpExpires");

  res.json({ success: true, data: users });
};

// ✅ Get specific user
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.userId).lean();
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ success: true, data: user });
};


const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const deleted = await User.findByIdAndDelete(userId);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Get user overall rank

const getUserRank = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const rankedUsers = await User.aggregate([
      {
        $addFields: {
          totalScore: { $sum: "$quizAttempted.score" },
        },
      },
      { $sort: { totalScore: -1 } },
      { $project: { _id: 1 } },
    ]);

    const userIndex = rankedUsers.findIndex(
      u => u._id.toString() === userId
    );

    if (userIndex === -1) {
      return res.status(404).json({ message: "User not found in ranking" });
    }

    res.json({
      success: true,
      rank: `${userIndex + 1}/${rankedUsers.length}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




module.exports = {
  getMyProfile,
  uploadMyProfileImage,
  storeQuizAttempt,
  getMyRank,
  getAllUsers,
  getUserById,
  deleteUser,
  getUserRank,
};
