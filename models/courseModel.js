const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
   subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },
    
    description: {
      type: String,
      required: true,
    },
    course_recommended: {
      type: String,
      enum: ["Yes", "No"],
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
    lectures: [
      {
        title: String,
        description: String,
        lecture: {
          public_id: {
            type: String,
            required: true,
          },
          secure_url: {
            type: String,
            required: true,
          },
        },
      },
    ],
    numberOfLectures: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },

    price: {
      type: Number,
      default: 0, 
    },
  },
  {
    timestamps: true, 
  }
);


module.exports = mongoose.model("course", courseSchema);
