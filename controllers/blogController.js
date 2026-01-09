const { pagination_ } = require("../helpers/pagination");
const blogsModel = require("../models/blogModel");
const coursesModel = require("../models/courseModel");
const path = require("path");

/**
 * Get All Published Blogs
 */


const findAllBlogs = async (req, res) => {
  try {
    const { page, limit, skip, hasPrevPage } = pagination_(req.query, {
      defaultLimit: 10,
      maxLimit: 60,
    });

    const filter = { blog_status: "Published" };

    const [blogs, total] = await Promise.all([
      blogsModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      blogsModel.countDocuments(filter),
    ]);

    if (!blogs.length) {
      return res.status(404).json({
        status: "0",
        message: "No blogs found",
      });
    }

    res.status(200).json({
      status: "1",
      message: "Blogs fetched successfully",
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasPrevPage,
        hasNextPage: skip + blogs.length < total,
      },
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      message: "Internal Server Error",
    });
  }
};


/**
 * Get Blog By Slug (Public)
 */
const findBlogBySlug = async (req, res) => {
  try {
    const blog = await blogsModel.findOne({
      blog_slug: req.params.slug,
      blog_status: "Published",
    });

    if (!blog) {
      return res.status(404).json({ status: "0", message: "Blog not found" });
    }

    res.status(200).json({
      status: "1",
      message: "Blog fetched successfully",
      data: blog,
    });
  } catch (error) {
    res.status(500).json({ status: "0", message: "Internal Server Error" });
  }
};


/**
 * Random Recommended Blogs + Courses
 */
const randomCourseBlogsGet = async (req, res) => {
  try {
    const blogs = await blogsModel.find({
      blog_recommended: "Yes",
      blog_status: "Published",
    });

    const courses = await coursesModel.find({
      course_recommended: "Yes",
    });

    const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());

    res.status(200).json({
      success: true,
      data: {
        blogs: shuffle(blogs).slice(0, 5),
        courses: shuffle(courses).slice(0, 5),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};




/**
 * Slug formatter
 */
const formatSlug = (title) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/**
 * Create Blog (Admin)
 */
const createBlogs = async (req, res) => {
  let author = req.user?._id
  try {
    const {
      blog_title,
      blog_content,
      blog_status,
      blog_published,
      blog_content_type,
      
      seo,
    } = req.body;

    if (!blog_title || !blog_content || !blog_content_type) {
      return res.status(400).json({ status: "0", message: "Missing fields" });
    }

    let blog_slug = formatSlug(blog_title);

    const slugExist = await blogsModel.findOne({ blog_slug });
    if (slugExist) blog_slug += `-${Date.now()}`;

    const thumbnailFile = req.files?.thumbnail?.[0];
    if (!thumbnailFile) {
      return res.status(400).json({ status: "0", message: "Thumbnail required" });
    }

    const parsedSeo = typeof seo === "string" ? JSON.parse(seo) : seo;

    const blog = await blogsModel.create({
      blog_title,
      blog_content,
      blog_status,
      blog_content_type,
      blog_published,
      blog_slug,
      author:author,
      thumbnail: {
        public_id: thumbnailFile.filename,
        secure_url: path.relative(__dirname, thumbnailFile.path),
      },
      seo: parsedSeo,
    });

    res.status(201).json({ status: "1", message: "Blog created", blog });
  } catch (error) {
    res.status(500).json({ status: "0", message: "Server Error" });
  }
};

/**
 * Update Blog
 */
const updateBlog = async (req, res) => {
    let author = req.user?._id
  try {
    const { blog_id } = req.params;
    const {
      blog_title,
      blog_content,
      blog_status,
      blog_published,
      blog_content_type,
      blog_recommended,
  
      seo,
    } = req.body;

    const blog = await blogsModel.findOne({ blog_id });

    if (!blog) {
      return res.status(404).json({
        status: "0",
        message: "Blog not found",
      });
    }

    /* ---------------- SLUG LOGIC ---------------- */
    if (blog_title && blog_title !== blog.blog_title) {
      let newSlug = blog_title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const slugExist = await blogsModel.findOne({
        blog_slug: newSlug,
        blog_id: { $ne: blog_id },
      });

      if (slugExist) {
        newSlug = `${newSlug}-${Date.now()}`;
      }

      blog.blog_title = blog_title;
      blog.blog_slug = newSlug;
    }

    /* ---------------- NORMAL UPDATES ---------------- */
    if (blog_content) blog.blog_content = blog_content;
    if (blog_status) blog.blog_status = blog_status;
    if (blog_content_type) blog.blog_content_type = blog_content_type;
    if (blog_published) blog.blog_published = blog_published;
    if (blog_recommended) blog.blog_recommended = blog_recommended;
    if (author) blog.author = author;

    /* ---------------- SEO UPDATE ---------------- */
    if (seo) {
      const parsedSeo = typeof seo === "string" ? JSON.parse(seo) : seo;
      blog.seo = {
        page_title: parsedSeo?.page_title || blog.seo.page_title,
        meta_keywords: parsedSeo?.meta_keywords || blog.seo.meta_keywords,
        meta_description:
          parsedSeo?.meta_description || blog.seo.meta_description,
        canonical_url:
          parsedSeo?.canonical_url || blog.seo.canonical_url,
      };
    }

    await blog.save();

    return res.status(200).json({
      status: "1",
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("Update Blog Error:", error);
    return res.status(500).json({
      status: "0",
      message: "Internal Server Error",
    });
  }
};


/**
 * Delete Blog
 */
const deleteBlogsById = async (req, res) => {
  try {
    const blog = await blogsModel.findOneAndDelete({
      blog_id: req.params.blog_id,
    });

    if (!blog) {
      return res.status(404).json({ status: "0", message: "Blog not found" });
    }

    res.status(200).json({ status: "1", message: "Blog deleted" });
  } catch (error) {
    res.status(500).json({ status: "0", message: "Server Error" });
  }
};

/**
 * Update Recommendation
 */
const updateBlogRecommendation = async (req, res) => {
  const { blog_recommended } = req.body;

  if (!["Yes", "No"].includes(blog_recommended)) {
    return res.status(400).json({ status: "0", message: "Invalid value" });
  }

  const blog = await blogsModel.findOne({ blog_id: req.params.blog_id });
  if (!blog) {
    return res.status(404).json({ status: "0", message: "Blog not found" });
  }

  blog.blog_recommended = blog_recommended;
  await blog.save();

  res.status(200).json({ status: "1", message: "Updated", blog });
};

const findAllBlogsByAdmin = async (req, res) => {
  try {
    const blogs = await blogsModel
      .find({})
      .sort({ createdAt: -1 });

    if (!blogs.length) {
      return res.status(404).json({ status: "0", message: "No blogs found" });
    }

    res.status(200).json({
      status: "1",
      message: "Blogs fetched successfully",
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({ status: "0", message: "Internal Server Error" });
  }
};

const findOneBlogById = async (req, res) => {
  try {

    const blog = await blogsModel.findById(req.params.blog_id);

    if (!blog) {
      return res.status(404).json({ status: "0", message: "Blog not found" });
    }

    res.status(200).json({
      status: "1",
      message: "Blog fetched successfully",
      data: blog,
    });
  } catch (error) {
    res.status(500).json({ status: "0", message: "Internal Server Error" });
  }
};


module.exports = {
  findAllBlogs,
  findBlogBySlug,
  randomCourseBlogsGet,
  createBlogs,
  updateBlog,
  deleteBlogsById,
  findOneBlogById,
  findAllBlogsByAdmin,
  updateBlogRecommendation,
};
