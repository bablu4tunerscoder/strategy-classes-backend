const mongoose = require("mongoose");
const blogSchema = new mongoose.Schema(
  {
    blog_title: {
      type: String,
      required: true,
    },
    blog_content: {
      type: String,
      required: true,
    },
    blog_content_type: {
  type: String,
  enum: ["Blog", "CurrentAffairs", "ExamNotifications", "Vocab"],
  required: true,
},
    blog_status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    blog_recommended: {
      type: String,
      enum: ["Yes", "No"],
    },
    blog_published: {
      type: String,
      required: true,
    },
    thumbnail: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    blog_slug: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seo: {
      page_title: {
        type: String,
      },
      meta_keywords: {
        type: Array,
        default: [],
      },
      meta_description: {
        type: String,
      },
      canonical_url: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PostBlogs", blogSchema);
