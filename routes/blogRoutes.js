const express = require("express");
const router = express.Router();
const BlogsController = require("../controllers/blogController");
const upload = require("../middlewares/multer-config");

router.get("/findAllBlogs", BlogsController.findAllBlogs);
router.get("/blogSlug/:slug", BlogsController.findBlogBySlug);

router.get("/random-courses-blogs", BlogsController.randomCourseBlogsGet);

module.exports = router;
