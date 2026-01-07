const mongoose = require("mongoose");

const testSeriesQuestionSchema = new mongoose.Schema(
  {
    testSeries: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostTestSeries",
      required: true,
    },

    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TestQuestion",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "TestSeriesQuestion",
  testSeriesQuestionSchema
);
