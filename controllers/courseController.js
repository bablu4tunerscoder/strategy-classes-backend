const courseModel = require("../models/courseModel");
const subjectModel = require("../models/subjectModel");

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const upload1 = require("../middlewares/multer-config");

dotenv.config(); // Load environment variables

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage Configuration for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = "courses";
    let resource_type = "image";

    // Handle video uploads for lecture files
    if (file.mimetype.startsWith("video/")) {
      resource_type = "video";
    }

    // Handle images for thumbnails
    if (file.mimetype.startsWith("image/")) {
      resource_type = "image";
    }

    return {
      folder: folder,
      resource_type: resource_type,
      allowed_formats: ["jpg", "png", "pdf", "mp4", "avi", "mov"],
    };
  },
});

// Multer Upload Configuration
const upload = multer({ storage });

// Add Course Functionality
const addCourses = async (req, res) => {
  try {
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "lectureFiles", maxCount: 10 },
    ])(req, res, async (err) => {
      if (err) {
        return res
          .status(400)
          .json({ error: "Error uploading files", details: err.message });
      }

      const { title, description, createdBy, lectures, subject_id, price } =
        req.body;

      // Validate required fields
      if (!title || !description || !createdBy || !lectures) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Validate and process thumbnail
      const thumbnailFile = req.files["thumbnail"]?.[0];
      if (!thumbnailFile) {
        return res.status(400).json({ error: "Thumbnail is required" });
      }

      const thumbnail = {
        public_id: thumbnailFile.filename,
        secure_url: thumbnailFile.path,
      };

      // Parse lectures and validate
      let parsedLectures;
      try {
        parsedLectures = JSON.parse(lectures);
      } catch (parseError) {
        return res.status(400).json({
          error: "Invalid lectures format. Must be a valid JSON array.",
        });
      }

      const lectureFiles = req.files["lectureFiles"];
      if (!lectureFiles || parsedLectures.length !== lectureFiles.length) {
        return res.status(400).json({
          error: "Mismatch between lectures metadata and uploaded files",
          metadataLength: parsedLectures.length,
          filesLength: lectureFiles ? lectureFiles.length : 0,
        });
      }

      // Process lectures
      const processedLectures = parsedLectures.map((lecture, index) => ({
        title: lecture.title,
        description: lecture.description,
        lecture: {
          public_id: lectureFiles[index].filename,
          secure_url: lectureFiles[index].path,
        },
      }));
      const lastUser = await courseModel
        .findOne()
        .sort({ course_id: -1 })
        .select("course_id");
      let newUserId = 1; // Default to 1 if no users exist

      if (lastUser) {
        newUserId = parseInt(lastUser.course_id) + 1; // Increment the highest userId by 1
      }
      // console.log("ids", newUserId);
      // Create course
      const course = new courseModel({
        course_id: newUserId.toString(),
        subject_id,
        title,
        description,
        thumbnail,
        lectures: processedLectures,
        numberOfLectures: processedLectures.length,
        createdBy,
        price: price || 0,
      });

      await course.save();

      res.status(201).json({
        message: "Course created successfully",
        course,
      });
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the course" });
  }
};

// Add Course Functionality
const addCourses_multer = async (req, res) => {
  try {
    const { title, description, createdBy, subject_id, lectures, price } =
      req.body;

    // Validate required fields
    if (!title || !description || !createdBy || !subject_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Process Thumbnail
    const thumbnailFile = req.files["thumbnail"]?.[0];
    if (!thumbnailFile) {
      return res.status(400).json({ error: "Thumbnail is required" });
    }

    const thumbnail = {
      public_id: thumbnailFile.filename,
      secure_url: path.relative(__dirname, thumbnailFile.path),
    };

    let processedLectures = [];
    if (lectures) {
      let parsedLectures;
      try {
        parsedLectures = JSON.parse(lectures); // Expecting lectures as a JSON array in the request body
      } catch (err) {
        return res.status(400).json({
          error: "Invalid lectures format. Must be a valid JSON array.",
        });
      }

      const lectureFiles = req.files["lectureFiles"];

      if (lectureFiles && parsedLectures.length !== lectureFiles.length) {
        return res.status(400).json({
          error: "Mismatch between lectures metadata and uploaded files",
          metadataLength: parsedLectures.length,
          filesLength: lectureFiles ? lectureFiles.length : 0,
        });
      }

      // Process Lectures if available
      if (lectureFiles) {
        processedLectures = parsedLectures.map((lecture, index) => ({
          title: lecture.title,
          description: lecture.description,
          lecture: {
            public_id: lectureFiles[index].filename,
            secure_url: path.relative(__dirname, lectureFiles[index].path),
          },
        }));
      }
    }

    // Generate a unique `course_id`
    const lastCourse = await courseModel
      .findOne()
      .sort({ course_id: -1 }) // Find the highest course_id
      .select("course_id");

    const newCourseId = lastCourse ? lastCourse.course_id + 1 : 1;

    // Create a Course
    const course = new courseModel({
      course_id: newCourseId,
      subject_id,
      title,
      description,
      thumbnail,
      lectures: processedLectures,
      numberOfLectures: processedLectures.length,
      createdBy,
      price: price || 0,
    });

    await course.save();

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).json({
        error: "Duplicate course_id. Please try again.",
      });
    } else {
      console.error("Error adding course:", err);
      res
        .status(500)
        .json({ error: "An error occurred while adding the course" });
    }
  }
};

// API to get all courses with subject details
const findAllCourses = async (req, res) => {
  try {
    // Step 1: Fetch all courses
    const courses = await courseModel.find(); // Fetch all courses

    if (!courses || courses.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "No courses found",
      });
    }

    // Step 2: Fetch subject details for each course
    const coursesWithSubjects = await Promise.all(
      courses.map(async (course) => {
        const subject = await subjectModel.findOne({
          subject_id: course.subject_id,
        }); // Fetch subject by subject_id
        return {
          ...course.toObject(), // Convert Mongoose document to plain object
          subject_details: subject || null, // Attach subject details (null if not found)
        };
      })
    );

    // Step 3: Return the combined data
    res.status(200).json({
      status: "1",
      message: "Courses retrieved successfully",
      data: coursesWithSubjects,
    });
  } catch (error) {
    // console.error("Error fetching courses:", error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while retrieving courses",
    });
  }
};

// API to get one course with subject details by course_id
const findOneID = async (req, res) => {
  try {
    // Step 1: Extract course_id from request parameters
    const { course_id } = req.params;

    // Step 2: Validate the input
    if (!course_id) {
      return res.status(400).json({
        status: "0",
        message: "course_id is required",
      });
    }

    // Step 3: Fetch the course by course_id
    const course = await courseModel.findOne({ course_id });

    if (!course) {
      return res.status(404).json({
        status: "0",
        message: `Course with course_id '${course_id}' not found`,
      });
    }

    // Step 4: Fetch the subject details using the subject_id from the course
    const subject = await subjectModel.findOne({
      subject_id: course.subject_id,
    });

    // Step 5: Combine course and subject details
    const courseWithSubject = {
      ...course.toObject(), // Convert Mongoose document to plain object
      subject_details: subject || null, // Attach subject details (null if not found)
    };

    // Step 6: Return the response
    res.status(200).json({
      status: "1",
      message: "Course retrieved successfully",
      data: courseWithSubject,
    });
  } catch (error) {
    // console.error("Error fetching course by ID:", error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while retrieving the course",
    });
  }
};

// API to update course details by course_id
const courseUpdate = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { title, description, createdBy, subject_id, lectures, price } =
      req.body;

    // Validate course_id
    if (!course_id) {
      return res
        .status(400)
        .json({ status: "0", error: "course_id is required" });
    }

    // Find the course by course_id
    const course = await courseModel.findOne({ course_id });
    if (!course) {
      return res.status(404).json({
        status: "0",
        error: `Course with course_id '${course_id}' not found`,
      });
    }

    // Update fields if they are provided
    if (title) course.title = title;
    if (description) course.description = description;
    if (createdBy) course.createdBy = createdBy;
    if (subject_id) course.subject_id = subject_id;
    if (price) course.price = price;

    // Process and update the thumbnail if provided
    const thumbnailFile = req.files["thumbnail"]?.[0];
    if (thumbnailFile) {
      course.thumbnail = {
        public_id: thumbnailFile.filename,
        secure_url: path.relative(__dirname, thumbnailFile.path),
      };
    }

    // Parse and validate lectures if provided
    if (lectures) {
      let parsedLectures;
      try {
        parsedLectures = JSON.parse(lectures); // Expecting lectures as a JSON array
      } catch (err) {
        return res.status(400).json({
          status: "0",
          error: "Invalid lectures format. Must be a valid JSON array.",
        });
      }

      const lectureFiles = req.files["lectureFiles"];
      if (lectureFiles && parsedLectures.length !== lectureFiles.length) {
        return res.status(400).json({
          status: "0",
          error: "Mismatch between lectures metadata and uploaded files",
          metadataLength: parsedLectures.length,
          filesLength: lectureFiles ? lectureFiles.length : 0,
        });
      }

      // Process and update lectures
      if (lectureFiles) {
        const processedLectures = parsedLectures.map((lecture, index) => ({
          title: lecture.title,
          description: lecture.description,
          lecture: {
            public_id: lectureFiles[index].filename,
            secure_url: path.relative(__dirname, lectureFiles[index].path),
          },
        }));
        course.lectures = processedLectures;
        course.numberOfLectures = processedLectures.length;
      }
    }

    // Save the updated course
    await course.save();

    res.status(200).json({
      status: "1",
      message: "Course updated successfully",
      course,
    });
  } catch (err) {
    // console.error("Error updating course:", err);
    res.status(500).json({
      status: "0",
      error: "An error occurred while updating the course",
    });
  }
};

// API to delete a course by course_id
const deleteCourses = async (req, res) => {
  try {
    const { course_id } = req.params;

    // Validate course_id
    if (!course_id) {
      return res
        .status(400)
        .json({ status: "0", error: "course_id is required" });
    }

    // Find and delete the course
    const deletedCourse = await courseModel.findOneAndDelete({ course_id });

    if (!deletedCourse) {
      return res.status(404).json({
        status: "0",
        error: `Course with course_id '${course_id}' not found`,
      });
    }

    res.status(200).json({
      status: "1",
      message: "Course deleted successfully",
      deletedCourse,
    });
  } catch (err) {
    // console.error("Error deleting course:", err);
    res.status(500).json({
      status: "0",
      error: "An error occurred while deleting the course",
    });
  }
};

// get courses by subject_id API
const getCoursesWithSubjectId = async (req, res) => {
  try {
    const { subject_id } = req.params;

    // Find courses with the specified subject_id
    const courses = await courseModel.find({
      subject_id: parseInt(subject_id),
    });

    if (courses.length === 0) {
      return res.status(404).json({
        Status: "0",
        message: "No courses found for the given subject_id",
      });
    }

    res.status(200).json({
      Status: "1",
      message: "Course With Subject Id  retrieved successfully",
      data: courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      Status: "0",
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get Courses With Subject Details

const getCourses = async (req, res) => {
  try {
    const { subject_id } = req.body; // Extract subject_id from request body

    let query = {}; // Default: Fetch all courses

    if (subject_id) {
      query.subject_id = parseInt(subject_id); // Apply filter only if subject_id is provided
    }

    // Fetch courses based on query
    const courses = await courseModel.find(query);

    if (!courses || courses.length === 0) {
      return res.status(404).json({
        status: "0",
        message: subject_id
          ? "No courses found for the given subject_id"
          : "No courses available",
      });
    }

    // Fetch subject details for each course
    const coursesWithSubjects = await Promise.all(
      courses.map(async (course) => {
        const subject = await subjectModel.findOne({
          subject_id: course.subject_id,
        }); // Fetch subject by subject_id

        return {
          ...course.toObject(), // Convert Mongoose document to plain object
          subject_details: subject || null, // Attach subject details (null if not found)
        };
      })
    );

    res.status(200).json({
      status: "1",
      message: subject_id
        ? "Courses retrieved successfully for the given subject_id"
        : "All courses retrieved successfully",
      data: coursesWithSubjects,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      status: "0",
      message: "An error occurred while retrieving courses",
    });
  }
};

//API to add only lectures
const addLecture = async (req, res) => {
  try {
    const { course_id, lectures } = req.body;

    // Validate required fields
    if (!course_id || !lectures) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the course by course_id
    const course = await courseModel.findOne({ course_id });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Parse and Validate Lectures
    let parsedLectures;
    try {
      parsedLectures = JSON.parse(lectures); // Expecting lectures as a JSON array in request body
    } catch (err) {
      return res.status(400).json({
        error: "Invalid lectures format. Must be a valid JSON array.",
      });
    }

    const lectureFiles = req.files;
    if (!lectureFiles || parsedLectures.length !== lectureFiles.length) {
      return res.status(400).json({
        error: "Mismatch between lectures metadata and uploaded files",
        metadataLength: parsedLectures.length,
        filesLength: lectureFiles ? lectureFiles.length : 0,
      });
    }

    // Process Lectures
    const processedLectures = parsedLectures.map((lecture, index) => ({
      title: lecture.title,
      description: lecture.description || "",
      lecture: {
        public_id: lectureFiles[index].filename,
        secure_url: path.relative(__dirname, lectureFiles[index].path),
      },
    }));

    // Add lectures to the course
    course.lectures.push(...processedLectures);
    course.numberOfLectures = course.lectures.length; // Update lecture count

    // Save updated course
    await course.save();

    res.status(200).json({ message: "Lecture(s) added successfully", course });
  } catch (error) {
    console.error("Error adding lecture:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//API to delete only lectures
const deleteLectureById = async (req, res) => {
  try {
    const { course_id, lecture_id } = req.params;

    if (!course_id) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required in the request body",
      });
    }

    // Find the course by course_id
    const course = await courseModel.findOne({ course_id });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Find the lecture index in the lectures array
    const lectureIndex = course.lectures.findIndex(
      (lecture) => lecture._id.toString() === lecture_id
    );

    if (lectureIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found in the given course",
      });
    }

    // Remove the lecture from the array
    course.lectures.splice(lectureIndex, 1);

    // Update the number of lectures
    course.numberOfLectures = course.lectures.length;

    // Save the updated course document
    await course.save();

    res.status(200).json({
      success: true,
      message: "Lecture deleted successfully",
      updatedCourse: course,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// Update Course Recommendation
const updateCourseRecommendation = async (req, res) => {
  const { course_id } = req.params; // Extract course_id from URL params
  const { course_recommended } = req.body; // Extract new course_recommended value from request body

  try {
    // Validate course_recommended value
    if (!["Yes", "No"].includes(course_recommended)) {
      return res.status(400).json({
        status: "0",
        message:
          "Invalid value for course_recommended. Valid values are 'Yes' or 'No'.",
      });
    }

    // Find the course by course_id
    const course = await courseModel.findOne({ course_id });

    if (!course) {
      return res.status(404).json({ status: "0", message: "Course not found" });
    }

    // Update the course_recommended field
    course.course_recommended = course_recommended;

    // Save the updated course document
    await course.save();

    return res.status(200).json({
      status: "1",
      message: "Course recommendation updated successfully",
      course,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "0", message: "Server error" });
  }
};

// update lacturs
const updateLecture = async (req, res) => {
  try {
    const { lecture_id, title, description } = req.body;
    const { course_id } = req.params;
    // Validate required fields
    if (!course_id || !lecture_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the course by course_id
    const course = await courseModel.findOne({ course_id });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find the lecture inside the course
    const lectureIndex = course.lectures.findIndex(
      (lecture) => lecture._id.toString() === lecture_id
    );

    if (lectureIndex === -1) {
      return res.status(404).json({ error: "Lecture not found" });
    }

    // Update lecture details
    if (title) course.lectures[lectureIndex].title = title;
    if (description) course.lectures[lectureIndex].description = description;

    // Check if a new file is uploaded
    if (req.file) {
      course.lectures[lectureIndex].lecture.public_id = req.file.filename;
      course.lectures[lectureIndex].lecture.secure_url = path.relative(
        __dirname,
        req.file.path
      );
    }

    // Save updated course
    await course.save();

    res.status(200).json({ message: "Lecture updated successfully", course });
  } catch (error) {
    console.error("Error updating lecture:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getSubjectByCourseId = async (req, res) => {
  try {
    const { course_id } = req.params;

    // Find course by course_id
    const course = await courseModel.findOne({ course_id });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Find subject by subject_id from the course
    const subject = await subjectModel.findOne({
      subject_id: course.subject_id,
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Return subject_id and subject_name
    res.status(200).json({
      course_name: course.title,
      subject_id: subject.subject_id,
      subject_name: subject.subject_name,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  addCourses,
  addCourses_multer,
  findAllCourses,
  findOneID,
  courseUpdate,
  deleteCourses,
  getCoursesWithSubjectId,
  getCourses,
  updateCourseRecommendation,
  addLecture,
  deleteLectureById,
  updateLecture,
  getSubjectByCourseId,
};
