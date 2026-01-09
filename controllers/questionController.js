const { pagination_ } = require("../helpers/pagination");
const { Question } = require("../models/questionModel");
const Postquiz = require("../models/quizdataModel");
const mongoose = require("mongoose");

/* =====================================
   1️⃣ Get All Questions
===================================== */

const getAllQuestions = async (req, res) => {
  try {
    const { page, limit, skip, hasPrevPage } = pagination_(req.query, {
      defaultLimit: 10,
      maxLimit: 60,
    });

    const [questions, total] = await Promise.all([
      Question.find()
        .populate("quiz")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Question.countDocuments(),
    ]);

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        status: "0",
        message: "No questions found",
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
      message: "Questions retrieved successfully",
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasPrevPage,
        hasNextPage: skip + questions.length < total,
      },
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      error: error.message,
    });
  }
};



const createQuestions = async (req, res) => {
  try {
    const {
      quiz,
      topic,
      question,
      options,
      correctOptionId,
      marks,
      answer_explanation,
    } = req.body;

    
    if (!quiz || !question || !options || correctOptionId === undefined) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["quiz", "question", "options", "correctOptionId"],
      });
    }

    if (!mongoose.Types.ObjectId.isValid(quiz)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    if (typeof question !== "string" || question.trim().length < 5) {
      return res.status(400).json({ error: "Question must be valid text" });
    }

    /* ---------- QUIZ EXISTS ---------- */
    const quizExists = await Postquiz.findById(quiz);
    if (!quizExists) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    /* ---------- OPTIONS VALIDATION ---------- */
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        error: "Options must be an array with at least 2 items",
      });
    }

    for (const opt of options) {
      if (
        typeof opt.id !== "number" ||
        typeof opt.text !== "string" ||
        !opt.text.trim()
      ) {
        return res.status(400).json({
          error: "Each option must have valid id and text",
        });
      }
    }

    /* ---------- CORRECT OPTION VALIDATION ---------- */
    const validCorrect = options.some(o => o.id === correctOptionId);
    if (!validCorrect) {
      return res.status(400).json({
        error: "correctOptionId must match one of the option ids",
      });
    }

    /* ---------- MARKS VALIDATION ---------- */
    if (marks !== undefined && (typeof marks !== "number" || marks < 0)) {
      return res.status(400).json({ error: "Marks must be a positive number" });
    }

    /* ---------- CREATE QUESTION ---------- */
    const newQuestion = await Question.create({
      quiz,
      topic,
      question,
      options,
      correctOptionId,
      marks: marks || 0,
      answer_explanation: answer_explanation || "",
    });

    res.status(201).json({
      message: "Question created successfully",
      data: newQuestion,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const updateQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid question ID" });
    }

    const questionDoc = await Question.findById(id);
    if (!questionDoc) {
      return res.status(404).json({ error: "Question not found" });
    }

    const { question, options, correctOptionId, marks } = req.body;

    if (question && (typeof question !== "string" || question.trim().length < 5)) {
      return res.status(400).json({ error: "Invalid question text" });
    }

    if (options) {
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ error: "Invalid options array" });
      }

      for (const opt of options) {
        if (typeof opt.id !== "number" || typeof opt.text !== "string") {
          return res.status(400).json({ error: "Invalid option format" });
        }
      }
    }

    if (correctOptionId !== undefined && options) {
      const isValid = options.some(o => o.id === correctOptionId);
      if (!isValid) {
        return res.status(400).json({ error: "Invalid correct option id" });
      }
    }

    if (marks !== undefined && (typeof marks !== "number" || marks < 0)) {
      return res.status(400).json({ error: "Invalid marks" });
    }

    Object.assign(questionDoc, req.body);
    await questionDoc.save();

    res.status(200).json({
      message: "Question updated successfully",
      data: questionDoc,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================
   4️⃣ Delete Question
===================================== */
const deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid question ID" });
    }

    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.status(200).json({
      message: "Question deleted successfully",
      data: deletedQuestion,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =====================================
   5️⃣ Get Questions by Quiz ID
===================================== */


const getQuestionsByQuizId = async (req, res) => {
  try {
    const { quiz_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quiz_id)) {
      return res.status(400).json({ error: "Invalid quiz ID" });
    }

    const { page, limit, skip, hasPrevPage } = pagination_(req.query, {
      defaultLimit: 10,
      maxLimit: 60,
    });

    const filter = { quiz: quiz_id };

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Question.countDocuments(filter),
    ]);

    if (!questions.length) {
      return res.status(404).json({
        status: "0",
        message: "No questions found for this quiz",
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
      message: "Questions fetched successfully",
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasPrevPage,
        hasNextPage: skip + questions.length < total,
      },
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      status: "0",
      error: error.message,
    });
  }
};


module.exports = {
  getAllQuestions,
  createQuestions,
  updateQuestionById,
  deleteById,
  getQuestionsByQuizId,
};
