const express = require("express");
const router = express.Router();
const BlogsController = require("../controllers/blogController");
const upload = require("../middlewares/multer-config");

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

router.get("/blogSlug/:slug", BlogsController.findBlogBySlug);

router.get("/findAllBlogs", BlogsController.findAllBlogs);

router.get("/findOneBlog/:blog_id", BlogsController.findOneBlog);

router.delete("/deleteBlog/:blog_id", BlogsController.deleteBlogsById);

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

router.put(
  "/blog_recommended/:blog_id",
  BlogsController.updateBlogRecommendation
);

router.get("/random-courses-blogs", BlogsController.randomCourseBlogsGet);

module.exports = router;
