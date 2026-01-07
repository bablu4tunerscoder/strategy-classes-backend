const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PostQuiz",
    required: true,
  },

  topic: {
    type: String,
    required: false,
  },
  question: {
    type: String,
    required: true,
  },
  options: [optionSchema],

  correctOptionId: {
    type: Number,
    required: true,
  },
  marks: {
    type: Number,
    default: 0,
  },
  answer_explanation: {
    type: String,
    required: true,
    default: "",
  },
});

module.exports = {
  questionSchema,
  Question: mongoose.model("Question", questionSchema),
};
