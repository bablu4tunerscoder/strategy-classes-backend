const mongoose = require("mongoose");
const TestQuestion = require("../models/testQuestionModel");
const PostTestSeries = require("../models/testSeriesPostModels");
const TestSeriesQuestion = require("../models/testSeriesQuestionModels");

/* ================= GET ALL QUESTIONS ================= */
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await TestQuestion.find();
    res.status(200).json({ data: questions });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/* ================= CREATE QUESTION ================= */
exports.createQuestion = async (req, res) => {
  try {
    const {
      testSeries, // ObjectId
      topic,
      question,
      options,
      correctAnswer,
      marks,
      answer_explanation,
    } = req.body;

    if (!testSeries || !question || !options || !correctAnswer) {
      return res.status(400).json({
        message: "testSeries, question, options, correctAnswer required",
      });
    }

    // 🔹 Check test series exists
    const seriesExists = await PostTestSeries.findById(testSeries);
    if (!seriesExists) {
      return res.status(404).json({ message: "Test series not found" });
    }

    // 🔹 Create question
    const newQuestion = await TestQuestion.create({
      topic,
      question,
      options,
      correctAnswer,
      marks,
      answer_explanation,
    });

    // 🔹 Map question to test series
    await TestSeriesQuestion.create({
      testSeries,
      question: newQuestion._id,
    });

    res.status(201).json({
      message: "Question created successfully",
      data: newQuestion,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

/* ================= UPDATE QUESTION ================= */
exports.updateQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid question id" });
    }

    const updated = await TestQuestion.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({
      message: "Question updated successfully",
      data: updated,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/* ================= DELETE QUESTION ================= */
exports.deleteQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid question id" });
    }

    const deleted = await TestQuestion.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Question not found" });
    }

    // 🔹 Remove mapping
    await TestSeriesQuestion.deleteMany({ question: id });

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/* ================= GET QUESTIONS BY TEST SERIES ================= */
exports.getQuestionsByTestSeries = async (req, res) => {
  try {
    const { testSeriesId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testSeriesId)) {
      return res.status(400).json({ message: "Invalid testSeries id" });
    }

    const questions = await TestSeriesQuestion.find({
      testSeries: testSeriesId,
    }).populate("question");

    res.status(200).json({
      total: questions.length,
      data: questions.map((q) => q.question),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

