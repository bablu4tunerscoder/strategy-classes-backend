const { Question } = require("../models/tseriesQuestionModels");
const Postquiz = require("../models/testSeriesModels");

const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    if (questions.length === 0) {
      return res.status(404).json({ message: "No questions found" });
    }
    res.status(200).json({
      message: "Questions retrieved successfully",
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while fetching questions",
      details: error.message,
    });
  }
};

const createQuestions = async (req, res) => {
  try {
    const {
      Tseries_id,
      topic,
      question,
      options,
      correctAnswer,
      marks,
      answer_explanation,
    } = req.body;

    // Validate required fields
    if (
      !Tseries_id ||
      !question ||
      !options ||
      !correctAnswer ||
      !answer_explanation
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        requiredFields: [
          "Tseries_id",
          "question",
          "options",
          "correctAnswer",
          "answer_explanation",
        ],
      });
    }

    // Generate custom question_id
    const question_id = Date.now().toString();

    // Create a new question
    const newQuestion = new Question({
      question_id,
      Tseries_id,
      topic,
      question,
      options,
      correctAnswer,
      marks,
      answer_explanation,
    });

    // Save the new question
    await newQuestion.save();

    // Create a question object to push to the quiz's questionArray
    const questionObject = {
      question_id,
      question,
    };

    // Update the quiz's questionArray with the custom question_id
    const updatedQuiz = await Postquiz.findOneAndUpdate(
      { Tseries_id },
      { $push: { questionArray: questionObject } }, // Push the string question_id
      { new: true } // Return the updated document
    );

    if (!updatedQuiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.status(201).json({
      message: "Question created successfully",
      data: newQuestion,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({
      error: "An error occurred while creating the question",
      details: error.message,
    });
  }
};

// Update a question by ID
const updateQuestionById = async (req, res) => {
  try {
    const { id } = req.params; // This should be question_id, not _id

    const updatedQuestion = await Question.findOneAndUpdate(
      { question_id: id }, // Find by question_id instead of _id
      req.body,
      {
        new: true,
        runValidators: true, // Ensures validations are applied during updates
      }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.status(200).json({
      message: "Question updated successfully",
      data: updatedQuestion,
    });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while updating the question",
      details: error.message,
    });
  }
};

// Delete a question by question_id
const deleteById = async (req, res) => {
  try {
    const { id } = req.params; // This is question_id, not _id

    const deletedQuestion = await Question.findOneAndDelete({ question_id: id });

    if (!deletedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.status(200).json({
      message: "Question deleted successfully",
      data: deletedQuestion,
    });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while deleting the question",
      details: error.message,
    });
  }
};

// Fetch all questions based on quiz_id
const getQuestionsByQuizId = async (req, res) => {
  try {
    const series_id = req.params.series_id;

    // Fetch all questions that have the given quiz_id
    const questions = await Question.find({ Tseries_id: series_id });

    if (!questions || questions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for this series." });
    }

    return res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getAllQuestions,
  createQuestions,
  updateQuestionById,
  deleteById,
  getQuestionsByQuizId,
};
