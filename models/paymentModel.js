const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostQuiz",
      default: null,
    },

    uploads: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Upload",
      },
    ],

    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    orderId: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
