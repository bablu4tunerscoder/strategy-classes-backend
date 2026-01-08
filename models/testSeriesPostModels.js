const mongoose = require("mongoose");

const postTestSeriesSchema = new mongoose.Schema(
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
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    thumbnail: {
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    },

    paid: { type: Boolean, default: false },
    price: { type: Number, default: 0 },

    negativeMarking: { type: Boolean, default: false },
    negativeMarkingValue: { type: Number, default: 0 },

    duration: { type: Number, required: true }, // minutes
  },
  { timestamps: true }
);

module.exports = mongoose.model("PostTestSeries", postTestSeriesSchema);
