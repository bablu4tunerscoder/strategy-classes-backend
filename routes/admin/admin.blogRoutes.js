const express = require("express");
const router = express.Router();
const BlogsController = require("../../controllers/blogController");
const upload = require("../../middlewares/multer-config");
const { authCheck, permissionCheck } = require("../../middlewares/middleware");

router.post(
  "/createBlogs",
  authCheck,
  permissionCheck("blog"),
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
   authCheck,
   permissionCheck("blog"),
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  BlogsController.updateBlog
);

router.get("/findAllBlogsByAdmin", authCheck,permissionCheck("blog"), BlogsController.findAllBlogsByAdmin);

router.delete("/deleteBlog/:blog_id", authCheck, permissionCheck("blog"),BlogsController.deleteBlogsById);

router.get("/findOneBlogbyId/:blog_id", authCheck,permissionCheck("blog"), BlogsController.findOneBlogById);

router.put(
  "/blog_recommended/:blog_id", authCheck,permissionCheck("blog"),
  BlogsController.updateBlogRecommendation
);

module.exports = router;
