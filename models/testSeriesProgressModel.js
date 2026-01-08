const mongoose = require("mongoose");

const testSeriesProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    guestId: {
      type: String,
      required: false,
    },

    completedTestSeries: [
      {
        testSeries: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PostTestSeries",
          required: true,
        },
        quizResult: [
          {
            question: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "TestQuestion",
              required: true,
            },
            selectedOption: String,
            isCorrect: Boolean,
          },
        ],
        completedAt: { type: Date, default: Date.now },
        score: { type: Number, default: 0 },
        timeTaken: { type: Number, default: 0 }, 
        totalQuestions: { type: Number, required: true },
        correctAnswers: { type: Number, default: 0 },
        incorrectAnswers: { type: Number, default: 0 },
        skippedQuestions: { type: Number, default: 0 },
      },
    ],

    totalCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestSeriesProgress", testSeriesProgressSchema);
