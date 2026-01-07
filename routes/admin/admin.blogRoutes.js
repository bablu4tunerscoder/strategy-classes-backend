const express = require("express");
const router = express.Router();
const BlogsController = require("../../controllers/blogController");
const upload = require("../../middlewares/multer-config");

router.post(
  "/createBlogs",
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  BlogsController.createBlogs
);

router.put(
  "/updateBlog/:blog_id",
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  BlogsController.updateBlog
);

router.get("/findAllBlogsByAdmin", BlogsController.findAllBlogsByAdmin);

router.delete("/deleteBlog/:blog_id", BlogsController.deleteBlogsById);

router.get("/findOneBlogbyId/:blog_id", BlogsController.findOneBlogById);

router.put(
  "/blog_recommended/:blog_id",
  BlogsController.updateBlogRecommendation
);

module.exports = router;
