const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    upload_type: {
      type: String,
      enum: ["Books", "Notes", "QuestionBank"], // 1→Books, 2→Notes, 3→QuestionBank
      required: true,
    },

    upload_price: {
      type: Number,
      default: 0,
    },

    upload_title: {
      type: String,
      required: true,
      trim: true,
    },

    upload_description: {
      type: String,
      required: true,
    },

    notes_description: {
      type: String,
      default: "",
    },

    upload_pdfs: [
      {
        filename: { type: String, required: true },
        path: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("UploadData", uploadSchema);
