const mongoose = require("mongoose");

const contactChangeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["email", "phoneNumber"],
      required: true,
    },

    newValue: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactChangeRequest", contactChangeSchema);
