const mongoose = require("mongoose");

const testQuestionSchema = new mongoose.Schema({
  topic: { type: String },

  question: { type: String, required: true },

  options: [
    {
      option: { type: String, required: true },
      id: { type: Number, required: true },
    },
  ],

  correctAnswer: { type: String, required: true },
  marks: { type: Number, default: 0 },
  answer_explanation: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("TestQuestion", testQuestionSchema);
