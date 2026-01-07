const mongoose = require("mongoose");
// const AutoIncrement = require("mongoose-sequence")(mongoose);

const subjectSchema = new mongoose.Schema(
  {
    subject_name: {
       type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Subject", subjectSchema);
