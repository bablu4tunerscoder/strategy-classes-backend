const mongoose = require("mongoose");
const PostTestSeries = require("../models/testSeriesPostModels");
const path = require("path");

/* ================= GET ALL TEST SERIES ================= */
const getQuizzes = async (req, res) => {
  try {
    const series = await PostTestSeries.find()
      .populate("subject", "subject_name")
      .populate("course", "title");

    res.status(200).json({
      message: "All Test Series fetched successfully",
      data: series,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= CREATE TEST SERIES ================= */
const createNewQuiz = async (req, res) => {
  try {
    const {
      title,
      subject,
      course,
      topic,
      paid,
      price,
      negativeMarking,
      negativeMarkingValue,
      duration,
    } = req.body;

    // Required validation
    if (!title || !subject || !course || !duration) {
      return res.status(400).json({
        error: "title, subject, course and duration are required",
      });
    }

    // ObjectId validation
    if (
      !mongoose.Types.ObjectId.isValid(subject) ||
      !mongoose.Types.ObjectId.isValid(course)
    ) {
      return res.status(400).json({
        error: "Invalid subject or course id",
      });
    }

    // Thumbnail
    const thumbnailFile = req.files?.thumbnail?.[0];
    if (!thumbnailFile) {
      return res.status(400).json({ error: "Thumbnail is required" });
    }

    const series = await PostTestSeries.create({
      title,
      subject,
      course,
      topic,
      paid: Boolean(paid),
      price: paid ? Number(price) : 0,
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
      message: "Test Series created successfully",
      data: series,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= GET TEST SERIES BY ID ================= */
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const series = await PostTestSeries.findById(id)
      .populate("subject")
      .populate("course");

    if (!series) {
      return res.status(404).json({ error: "Test series not found" });
    }

    res.status(200).json({ data: series });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= UPDATE TEST SERIES ================= */
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const series = await PostTestSeries.findById(id);
    if (!series) {
      return res.status(404).json({ error: "Test series not found" });
    }

    const allowedFields = [
      "title",
      "subject",
      "course",
      "topic",
      "paid",
      "price",
      "negativeMarking",
      "negativeMarkingValue",
      "duration",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        series[field] = req.body[field];
      }
    });

    const thumbnailFile = req.files?.thumbnail?.[0];
    if (thumbnailFile) {
      series.thumbnail = {
        public_id: thumbnailFile.filename,
        secure_url: path.relative(__dirname, thumbnailFile.path),
      };
    }

    await series.save();

    res.status(200).json({
      message: "Test series updated successfully",
      data: series,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= DELETE TEST SERIES ================= */
const deleteQuizById = async (req, res) => {
  try {
    await PostTestSeries.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Test series deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ================= GET SERIES BY SUBJECT ================= */
const getSeriesWithSubjectId = async (req, res) => {
  try {
    const { subjectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ error: "Invalid subject id" });
    }

    const series = await PostTestSeries.find({ subject: subjectId });

    res.status(200).json({
      data: series,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getQuizzes,
  createNewQuiz,
  getQuizById,
  updateQuiz,
  deleteQuizById,
  getSeriesWithSubjectId,
};
