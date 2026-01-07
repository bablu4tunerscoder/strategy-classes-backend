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
    // category: {
    //   type: String,
    //   required: true,
    // },
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
      ref: "User", // admin user
      required: true,
    },

    price: {
      type: Number,
      default: 0, // 0 = free course
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Apply the AutoIncrement plugin to the schema for subject_id
// courseSchema.plugin(AutoIncrement, { inc_field: "course_id" });
module.exports = mongoose.model("course", courseSchema);
