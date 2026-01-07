const mongoose = require("mongoose");
const { quizAttemptedSchema } = require("./quizAttemptedSchema");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      match: /\S+@\S+\.\S+/,
    },

    phoneNumber: {
      type: String,
      unique: true,
      required: true,
      match: /^\d{10}$/,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    interestedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    state: {
      type: String,
      default: null,
    },

    city: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },

     permissions: {
      type: [String],
      default: []
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending", "blocked"],
      default: "pending",
    },

    profileImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      default: null,
    },

    points: {
      type: Number,
      default: 0,
    },

    quizAttempted: [quizAttemptedSchema],

    otp: {
      type: String,
      default: null,
    },

    otpExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
