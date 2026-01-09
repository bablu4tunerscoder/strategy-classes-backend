const PostQuiz = require("../models/quizdataModel");
const path = require("path");
const mongoose = require("mongoose");
const { pagination_ } = require("../helpers/pagination");

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);


/* ================= CREATE QUIZ ================= */
const createNewQuiz = async (req, res) => {
  try {
    const {
      title,
      subject,
      course,
      topic,
      isPaid,
      price,
      negativeMarking,
      negativeMarkingValue,
      duration,
    } = req.body;

    // Required
    if (!title || !subject || !course || !duration) {
      return res.status(400).json({
        error: "Required fields missing",
      });
    }

    // ObjectId validation
    if (!isValidObjectId(subject) || !isValidObjectId(course)) {
      return res.status(400).json({
        error: "Invalid subject or course id",
      });
    }

    // Duration
    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({
        error: "Duration must be a positive number",
      });
    }

    // Paid logic
    if (isPaid && (!price || price <= 0)) {
      return res.status(400).json({
        error: "Price required for paid quiz",
      });
    }

    // Negative marking logic
    if (negativeMarking && negativeMarkingValue <= 0) {
      return res.status(400).json({
        error: "Negative marking value must be greater than 0",
      });
    }

    // Thumbnail
    const thumbnailFile = req.files?.thumbnail?.[0];
    if (!thumbnailFile) {
      return res.status(400).json({ error: "Thumbnail is required" });
    }

    const quiz = await PostQuiz.create({
      title,
      subject,
      course,
      topic,
      isPaid: Boolean(isPaid),
      price: isPaid ? Number(price) : 0,
      negativeMarking: Boolean(negativeMarking),
      negativeMarkingValue: negativeMarking
        ? Number(negativeMarkingValue)
        : 0,
      duration: Number(duration),
      thumbnail: {
        public_id: thumbnailFile.filename,
        secure_url: path.relative(__dirname, thumbnailFile.path),
      },
    });

    res.status(201).json({
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ================= GET ALL QUIZZES ================= */

const getQuizzes = async (req, res) => {
  try {
    const { page, limit, skip, hasPrevPage } = pagination_(req.query, {
      defaultLimit: 10,
      maxLimit: 60,
    });

    const [quizzes, total] = await Promise.all([
      PostQuiz.find()
        .populate("subject", "title")
        .populate("course", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      PostQuiz.countDocuments(),
    ]);

    if (!quizzes.length) {
      return res.status(404).json({
        status: "0",
        message: "No quizzes found",
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasPrevPage,
          hasNextPage: false,
        },
        data: [],
      });
    }

    res.status(200).json({
      status: "1",
      message: "All quizzes fetched",
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasPrevPage,
        hasNextPage: skip + quizzes.length < total,
      },
      data: quizzes,
    });
  } catch (err) {
    res.status(500).json({
      status: "0",
      error: err.message,
    });
  }
};


/* ================= GET QUIZ BY ID ================= */
const getQuizById = async (req, res) => {
  try {
    const quiz = await PostQuiz.findById(req.params.id)
      .populate("subject")
      .populate("course");

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.status(200).json({ data: quiz });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ================= UPDATE QUIZ ================= */
const updateQuiz = async (req, res) => {
  try {
    const quiz = await PostQuiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    const allowedFields = [
      "title",
      "subject",
      "course",
      "topic",
      "isPaid",
      "price",
      "negativeMarking",
      "negativeMarkingValue",
      "duration",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        quiz[field] = req.body[field];
      }
    });

    // ObjectId validation
    if (
      quiz.subject &&
      !isValidObjectId(quiz.subject)
    ) {
      return res.status(400).json({ error: "Invalid subject id" });
    }

    if (
      quiz.course &&
      !isValidObjectId(quiz.course)
    ) {
      return res.status(400).json({ error: "Invalid course id" });
    }

    // Paid validation
    if (quiz.isPaid && quiz.price <= 0) {
      return res.status(400).json({
        error: "Paid quiz must have price",
      });
    }

    // Negative marking validation
    if (quiz.negativeMarking && quiz.negativeMarkingValue <= 0) {
      return res.status(400).json({
        error: "Invalid negative marking value",
      });
    }

    // Duration
    if (quiz.duration <= 0) {
      return res.status(400).json({
        error: "Duration must be positive",
      });
    }

    // Thumbnail
    const thumbnailFile = req.files?.thumbnail?.[0];
    if (thumbnailFile) {
      quiz.thumbnail = {
        public_id: thumbnailFile.filename,
        secure_url: path.relative(__dirname, thumbnailFile.path),
      };
    }

    await quiz.save();

    res.status(200).json({
      message: "Quiz updated successfully",
      data: quiz,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ================= DELETE QUIZ ================= */
const deleteQuizById = async (req, res) => {
  try {
    await PostQuiz.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ================= GET QUIZ BY COURSE ================= */

const getQuizWithCourseId = async (req, res) => {
  try {
    const { page, limit, skip, hasPrevPage } = pagination_(req.query, {
      defaultLimit: 10,
      maxLimit: 60,
    });

    const filter = { course: req.params.course_id };

    const [quizzes, total] = await Promise.all([
      PostQuiz.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      PostQuiz.countDocuments(filter),
    ]);

    if (!quizzes.length) {
      return res.status(404).json({
        status: "0",
        message: "No quizzes found for this course",
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasPrevPage,
          hasNextPage: false,
        },
        data: [],
      });
    }

    res.status(200).json({
      status: "1",
      message: "Quizzes fetched successfully",
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasPrevPage,
        hasNextPage: skip + quizzes.length < total,
      },
      data: quizzes,
    });
  } catch (err) {
    res.status(500).json({
      status: "0",
      error: err.message,
    });
  }
};


module.exports = {
  createNewQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuizById,
  getQuizWithCourseId,
};
