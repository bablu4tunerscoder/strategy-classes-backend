const mongoose = require("mongoose");

const postQuizSchema = new mongoose.Schema(
  {

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    topic: {
      type: String,
      default: null,
      required: false,
    },

    title: {
      type: String,
      required: true,
    },

    thumbnail: {
      public_id: {
        type: String,
        required: true,
      },
      secure_url: {
        type: String,
        required: true,
      },
    },

    isPaid: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    negativeMarking: {
      type: Boolean,
      default: false,
    },
    negativeMarkingValue: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PostQuiz = mongoose.model("PostQuiz", postQuizSchema);

module.exports = PostQuiz;
