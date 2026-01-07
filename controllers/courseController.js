const courseModel = require("../models/courseModel");



// Add Course Functionality
const addCourse = async (req, res) => {
  try {
    const { title, description, subject, createdBy, lectures, price } = req.body;

    if (!title || !description || !subject || !createdBy) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const thumbnail = req.files?.thumbnail?.[0];
    if (!thumbnail) {
      return res.status(400).json({ error: "Thumbnail required" });
    }

    let parsedLectures = lectures ? JSON.parse(lectures) : [];
    const lectureFiles = req.files?.lectureFiles || [];

    if (parsedLectures.length !== lectureFiles.length) {
      return res.status(400).json({ error: "Lecture mismatch" });
    }

    const formattedLectures = parsedLectures.map((l, i) => ({
      title: l.title,
      description: l.description,
      lecture: {
        public_id: lectureFiles[i].filename,
        secure_url: lectureFiles[i].path,
      },
    }));

    const course = await courseModel.create({
      title,
      description,
      subject,
      createdBy,
      price: price || 0,
      thumbnail: {
        public_id: thumbnail.filename,
        secure_url: thumbnail.path,
      },
      lectures: formattedLectures,
      numberOfLectures: formattedLectures.length,
    });

    res.status(201).json({ message: "Course created", course });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// API to get all courses with subject details
const findAllCourses = async (req, res) => {
  const courses = await courseModel
    .find()
    .populate("subject")
    .populate("createdBy", "name email");

  res.json({ status: "1", data: courses });
};


// API to get one course with subject details by course_id
const findOneID = async (req, res) => {
  const course = await courseModel
    .findById(req.params.course_id)
    .populate("subject");

  if (!course) return res.status(404).json({ error: "Not found" });
  res.json({ status: "1", data: course });
};


// API to update course details by course_id
const courseUpdate = async (req, res) => {
  try {
    const { title, description, subject, lectures, price } = req.body;

    const course = await courseModel.findById(req.params.course_id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }


    if (title) course.title = title;
    if (description) course.description = description;
    if (subject) course.subject = subject;
    if (price !== undefined) course.price = price;

 
    const thumbnail = req.files?.thumbnail?.[0];
    if (thumbnail) {
      course.thumbnail = {
        public_id: thumbnail.filename,
        secure_url: thumbnail.path,
      };
    }


    if (lectures) {
      let parsedLectures = JSON.parse(lectures);
      const lectureFiles = req.files?.lectureFiles || [];

      if (parsedLectures.length !== lectureFiles.length) {
        return res.status(400).json({ error: "Lecture mismatch" });
      }

      course.lectures = parsedLectures.map((l, i) => ({
        title: l.title,
        description: l.description,
        lecture: {
          public_id: lectureFiles[i].filename,
          secure_url: lectureFiles[i].path,
        },
      }));

      course.numberOfLectures = course.lectures.length;
    }

    await course.save();

    res.json({ message: "Course updated successfully", course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const updateCourseRecommendation = async (req, res) => {
  const { course_id } = req.params; 
  const { course_recommended } = req.body; 

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
    const course = await courseModel.findById(course_id);

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


const deleteCourses = async (req, res) => {
  try {
   const course = await courseModel.findByIdAndDelete(req.params.id);
      res.status(200).json({
      message: "Course deleted successfully",
      course: course,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};


// get courses by subject_id API
const getCoursesWithSubjectId = async (req, res) => {
  try {
   const courses = await courseModel.find({ subject: req.params.subjectId });
   res.json({ data: courses });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};


//API to add only lectures
const addLecture = async (req, res) => {
  const course = await courseModel.findById(req.params.id);
  if (!course) return res.status(404).json({ error: "Not found" });

  course.lectures.push({
    title: req.body.title,
    description: req.body.description,
    lecture: {
      public_id: req.file.filename,
      secure_url: req.file.path,
    },
  });

  course.numberOfLectures = course.lectures.length;
  await course.save();
  res.json({ message: "Lecture added", course });
};


//API to delete only lectures
const deleteLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;

    if (!lectureId) {
      return res.status(400).json({ error: "Lecture ID required" });
    }

    // course find jisme ye lecture ho
    const course = await courseModel.findOne({ "lectures._id": lectureId });

    if (!course) {
      return res.status(404).json({ error: "Lecture not found" });
    }

    // lecture remove
    course.lectures.id(lectureId).remove();

    // lecture count update
    course.numberOfLectures = course.lectures.length;

    await course.save();

    res.json({
      message: "Lecture deleted successfully",
      remainingLectures: course.numberOfLectures,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// update lacturs
const updateLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { title, description } = req.body;

    if (!lectureId) {
      return res.status(400).json({ error: "Lecture ID is required" });
    }

    // Find course which contains this lecture
    const course = await courseModel.findOne({
      "lectures._id": lectureId,
    });

    if (!course) {
      return res.status(404).json({ error: "Lecture not found" });
    }

    // Get lecture sub-document
    const lecture = course.lectures.id(lectureId);

    // Update fields
    if (title) lecture.title = title;
    if (description) lecture.description = description;

    // Update lecture file if uploaded
    if (req.file) {
      lecture.lecture = {
        public_id: req.file.filename,
        secure_url: req.file.path,
      };
    }

    await course.save();

    res.status(200).json({
      message: "Lecture updated successfully",
      lecture,
    });
  } catch (error) {
    console.error("Error updating lecture:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addCourse,
  findAllCourses,
  findOneID,
  courseUpdate,
  deleteCourses,
  getCoursesWithSubjectId,
  updateCourseRecommendation,
  addLecture,
  deleteLectureById,
  updateLecture,
};
