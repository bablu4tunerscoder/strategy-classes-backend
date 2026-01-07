// const blogModel = require("../models/blogModel");
const blogsModel = require("../models/blogModel");
const coursesModel = require("../models/courseModel");
const path = require("path");

// Function to format the slug correctly
const formatSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Create Blog API
const createBlogs = async (req, res) => {
  try {
    const {
      blog_title,
      blog_content,
      blog_status,
      blog_published,
      blog_content_type,
      author,
      seo,
    } = req.body;

    if (
      !blog_title ||
      !blog_content ||
      !blog_published ||
      !author ||
      !seo ||
      !blog_content_type
    ) {
      return res
        .status(400)
        .json({ status: "0", message: "All fields are required." });
    }
    const lastBlogs = await blogsModel
      .findOne()
      .sort({ blog_id: -1 })
      .select("blog_id");
    const newBlogId = lastBlogs ? lastBlogs.blog_id + 1 : 1;

    // Handle Slug
    let blog_slug = formatSlug(req.body.blog_slug || blog_title);
    const existingSlug = await blogsModel.findOne({ blog_slug });
    if (existingSlug) {
      blog_slug += `-${newBlogId}`;
    }
    // Parse `seo` JSON string to object
let parsedSeo;

try {
  parsedSeo = typeof seo === "string" ? JSON.parse(seo) : seo;
} catch (err) {
  return res
    .status(400)
    .json({ status: "0", message: "Invalid SEO format" });
}
    // Thumbnail Handling
    // Process Thumbnail
    const thumbnailFile = req.files["thumbnail"]?.[0];
    if (!thumbnailFile) {
      return res
        .status(400)
        .json({ status: "0", error: "Thumbnail is required" });
    }

    const thumbnail = {
      public_id: thumbnailFile.filename,
      secure_url: path.relative(__dirname, thumbnailFile.path),
    };

    // Create Blog
    const newBlog = new blogsModel({
      blog_id: newBlogId,
      blog_title,
      blog_content,
      blog_status,
      blog_content_type,
      blog_published,
      thumbnail,
      blog_slug,
      author,
      seo: {
        page_title: parsedSeo.page_title,
        meta_keywords: parsedSeo.meta_keywords,
        meta_description: parsedSeo.meta_description,
        canonical_url: parsedSeo.canonical_url,
      },
    });

    await newBlog.save();
    res.status(201).json({
      status: "1",
      message: "Blog created successfully",
      blog: newBlog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Find blog by slug API
const findBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Find the blog by slug
    const blog = await blogsModel.findOne({ blog_slug: slug });

    if (!blog) {
      return res.status(404).json({ status: "0", message: "Blog not found" });
    }

    res.status(200).json({
      status: "1",
      message: "Blog retrieved successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ status: "0", message: "Internal Server Error" });
  }
};

// Find all blogs API
const findAllBlogs = async (req, res) => {
  try {
    // Fetch all blogs from the database
    const blogs = await blogsModel.find().sort({ createdAt: -1 });

    if (blogs.length === 0) {
      return res.status(404).json({ status: "0", message: "No blogs found" });
    }

    res.status(200).json({
      status: "1",
      message: "Blog retrieved successfully",
      data: blogs,
    });
  } catch (error) {
    // console.error("Error fetching blogs:", error);
    res.status(500).json({ status: "0", message: "Internal Server Error" });
  }
};

// ✅ Find One Blog by blog_id API
const findOneBlog = async (req, res) => {
  try {
    const { blog_id } = req.params; // Extract blog_id from request parameters

    // Validate blog_id
    if (!blog_id) {
      return res
        .status(400)
        .json({ status: "0", message: "Blog ID is required" });
    }

    // Find the blog by blog_id
    const blog = await blogsModel.findOne({ blog_id: parseInt(blog_id) });

    // If no blog found, return 404 error
    if (!blog) {
      return res.status(404).json({ status: "0", message: "Blog not found" });
    }

    // Return the found blog

    res.status(200).json({
      status: "1",
      message: "Blog retrieved successfully",
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Delete Blog by blog_id API
const deleteBlogsById = async (req, res) => {
  try {
    const { blog_id } = req.params; // Extract blog_id from request parameters

    // Validate blog_id
    if (!blog_id) {
      return res
        .status(400)
        .json({ status: "0", message: "Blog ID is required" });
    }

    // Find and delete the blog by blog_id
    const deletedBlog = await blogsModel.findOneAndDelete({
      blog_id: parseInt(blog_id),
    });

    // If no blog found, return 404 error
    if (!deletedBlog) {
      return res.status(404).json({ status: "0", message: "Blog not found" });
    }

    // Return success response
    res.status(200).json({
      status: "1",
      message: "Blog deleted successfully",
      data: deletedBlog,
    });
  } catch (error) {
    console.error("Error deleting blog by ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Update Blog by blog_id API
// const updateBlog = async (req, res) => {
//   try {
//     const { blog_id } = req.params; // Extract blog_id from request parameters
//     const {
//       blog_title,
//       blog_content,
//       blog_status,
//       blog_published,
//       blog_content_type,
//       author,
//       seo,
//     } = req.body;

//     // Find the blog by blog_id
//     const blogToUpdate = await blogsModel.findOne({
//       blog_id: parseInt(blog_id),
//     });

//     if (!blogToUpdate) {
//       return res.status(404).json({ status: "0", message: "Blog not found" });
//     }

//     // Handle Slug
//     let blog_slug = formatSlug(req.body.blog_slug || blogToUpdate.blog_slug); // Ensure existing slug is used if no new one provided
//     const existingSlug = await blogsModel.findOne({
//       blog_slug,
//       blog_id: { $ne: blog_id }, // Ensure unique slug except for the current blog
//     });

//     if (existingSlug) {
//       blog_slug += `-${blog_id}`;
//     }

//     // Parse `seo` JSON string to object if it's a string
//     const parsedSeo = typeof seo === "string" ? JSON.parse(seo) : seo;

//     // Process and update the thumbnail if a new file is provided
//     let updatedThumbnail = blogToUpdate.thumbnail;
//     if (req.files && req.files["thumbnail"]?.[0]) {
//       const thumbnailFile = req.files["thumbnail"][0];
//       updatedThumbnail = {
//         public_id: thumbnailFile.filename,
//         secure_url: path.relative(__dirname, thumbnailFile.path),
//       };
//     }

//     // Update only the fields that are provided in the request
//     if (blog_title) blogToUpdate.blog_title = blog_title;
//     if (blog_content) blogToUpdate.blog_content = blog_content;
//     if (blog_status) blogToUpdate.blog_status = blog_status;
//     if (blog_content_type) blogToUpdate.blog_content_type = blog_content_type;
//     if (blog_published) blogToUpdate.blog_published = blog_published;
//     if (blog_slug) blogToUpdate.blog_slug = blog_slug;
//     if (updatedThumbnail) blogToUpdate.thumbnail = updatedThumbnail;
//     if (author) blogToUpdate.author = author;
//     if (parsedSeo) {
//       blogToUpdate.seo = {
//         page_title: parsedSeo.page_title,
//         meta_keywords: parsedSeo.meta_keywords,
//         meta_description: parsedSeo.meta_description,
//       };
//     }

//     await blogToUpdate.save();

//     res.status(200).json({
//       status: "1",
//       message: "Blog updated successfully",
//       blog: blogToUpdate,
//     });
//   } catch (error) {
//     console.error("Error updating blog:", error);
//     res.status(500).json({ status: "0", message: "Internal Server Error" });
//   }
// };

const updateBlog = async (req, res) => {
  try {
    const { blog_id } = req.params;
    const {
      blog_title,
      blog_content,
      blog_status,
      blog_published,
      blog_content_type,
      author,
      seo,
    } = req.body;

    // console.log("Request Body:", req.body);

    // if (!blog_title || !blog_content || !blog_published || !author || !seo) {
    //   return res.status(400).json({ status: "0", message: "All fields are required." });
    // }

    const blogToUpdate = await blogsModel.findOne({
      blog_id: parseInt(blog_id),
    });

    if (!blogToUpdate) {
      return res.status(404).json({ status: "0", message: "Blog not found" });
    }

    let blog_slug = formatSlug(req.body.blog_slug || blog_title);

    if (blog_slug) {
      const existingSlug = await blogsModel.findOne({
        blog_slug,
        blog_id: { $ne: blog_id },
      });

      if (existingSlug) {
        blog_slug += `-${blog_id}`;
      }
    }

    let parsedSeo;
    try {
      parsedSeo = typeof seo === "string" ? JSON.parse(seo) : seo;
    } catch (err) {
      return res
        .status(400)
        .json({ status: "0", message: "Invalid SEO format" });
    }

    let updatedThumbnail = blogToUpdate.thumbnail;
    if (req.files && req.files["thumbnail"]?.[0]) {
      const thumbnailFile = req.files["thumbnail"][0];
      updatedThumbnail = {
        public_id: thumbnailFile.filename,
        secure_url: path.relative(__dirname, thumbnailFile.path),
      };
    }

    blogToUpdate.blog_title = blog_title;
    blogToUpdate.blog_content = blog_content;
    blogToUpdate.blog_status = blog_status;
    blogToUpdate.blog_content_type = blog_content_type;
    blogToUpdate.blog_published = blog_published;
    blogToUpdate.blog_slug = blog_slug;
    blogToUpdate.thumbnail = updatedThumbnail;
    blogToUpdate.author = author;
    blogToUpdate.seo = {
      page_title: parsedSeo?.page_title || "",
      meta_keywords: parsedSeo?.meta_keywords || [],
      meta_description: parsedSeo?.meta_description || "",
      canonical_url: parsedSeo?.canonical_url || "",
    };

    await blogToUpdate.save();

    res.status(200).json({
      status: "1",
      message: "Blog updated successfully",
      blog: blogToUpdate,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ status: "0", message: "Internal Server Error" });
  }
};

// Update Blog Recommendation
const updateBlogRecommendation = async (req, res) => {
  const { blog_id } = req.params; // Extract course_id from URL params
  const { blog_recommended } = req.body; // Extract new blog_recommended value from request body

  try {
    // Validate blog_recommended value
    if (!["Yes", "No"].includes(blog_recommended)) {
      return res.status(400).json({
        status: "0",
        message:
          "Invalid value for blog_recommended. Valid values are 'Yes' or 'No'.",
      });
    }

    // Find the blog by course_id
    const blog = await blogsModel.findOne({ blog_id });

    if (!blog) {
      return res.status(404).json({ status: "0", message: "Blog not found" });
    }

    // ✅ Check if blog_content_type is "3"
    if (blog.blog_content_type !== "3") {
      return res.status(403).json({
        status: "0",
        message:
          "You can only update recommended status for blog_content_type '3'.",
      });
    }

    // Update the blog_recommended field
    blog.blog_recommended = blog_recommended;

    // Save the updated blog document
    await blog.save();

    return res.status(200).json({
      status: "1",
      message: "Blog recommendation updated successfully",
      blog,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "0", message: "Server error" });
  }
};

const randomCourseBlogsGet = async (req, res) => {
  try {
    // Fetch all recommended courses
    const allRecommendedCourses = await coursesModel.find({
      course_recommended: "Yes",
    });

    // Fetch all recommended blogs
    const allRecommendedBlogs = await blogsModel.find({
      blog_recommended: "Yes",
    });

    // Function to shuffle and get 5 random items
    const getRandomItems = (arr, num) => {
      let shuffled = arr.sort(() => 0.5 - Math.random()); // Shuffle array
      return shuffled.slice(0, num); // Pick first 'num' items
    };

    // Select 5 random courses and blogs
    const randomCourses = getRandomItems(allRecommendedCourses, 5);
    const randomBlogs = getRandomItems(allRecommendedBlogs, 5);

    return res.status(200).json({
      success: true,
      message: "Random recommended courses and blogs fetched successfully",
      data: {
        courses: randomCourses,
        blogs: randomBlogs,
      },
    });
  } catch (error) {
    console.error("Error fetching random courses and blogs:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Could not fetch recommended courses and blogs.",
    });
  }
};

module.exports = {
  createBlogs,
  findBlogBySlug,
  findAllBlogs,
  findOneBlog,
  deleteBlogsById,
  updateBlog,
  updateBlogRecommendation,
  randomCourseBlogsGet,
};
