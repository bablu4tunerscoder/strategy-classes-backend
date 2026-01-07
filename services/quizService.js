const Postquiz = require("../models/quizdataModel");

const mongoose = require("mongoose");

const getAllQuizzes = async () => {
  try {
    return await Postquiz.find().lean().exec();
  } catch (err) {
    throw new Error("Error fetching quizzes: " + err.message);
  }
};

const createQuiz = async (quizData) => {
  try {
    return await Postquiz.create(quizData);
  } catch (err) {
    throw new Error("Error creating quiz: " + err.message);
  }
};

const getQuizById = async (quizId) => {
  try {
    // Ensure the quizId is a valid string (no need for ObjectId check)
    if (!quizId || typeof quizId !== "string") {
      throw new Error("Invalid quiz ID");
    }

    // Search for the quiz by quiz_id (string type)
    const quiz = await Postquiz.findOne({ quiz_id: quizId });

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    return quiz;
  } catch (err) {
    throw new Error("Error fetching quiz by ID: " + err.message);
  }
};

const deleteQuizById = async (quizId) => {
  try {
    // Ensure the quizId is a valid string (no need for ObjectId check)
    if (!quizId || typeof quizId !== "string") {
      throw new Error("Invalid quiz ID");
    }

    const quiz = await Postquiz.findOneAndDelete({ quiz_id: quizId });
    if (!quiz) {
      throw new Error("Quiz not found");
    }
    return quiz;
  } catch (error) {
    throw new Error("Error deleting quiz by ID: " + error.message);
  }
};

const updateQuizById = async (quizId, updateData) => {
  try {
    // Ensure the quizId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      console.log("Invalid quiz ID");
      throw new Error("Invalid quiz ID");
    }

    // Update the quiz by its ID
    const quiz = await Postquiz.findOneAndUpdate(
      { _id: quizId }, // Filter: Search by _id
      updateData, // Update: The data you want to update
      { new: true } // Option: Return the updated document
    );

    console.log("Quiz fetched from DB:", quiz);

    if (!quiz) {
      console.log("Quiz not found");
      throw new Error("Quiz not found");
    }

    return quiz;
  } catch (error) {
    console.error("Error in updateQuizById:", error.message); // Use error, not err
    throw new Error("Error updating quiz by ID: " + error.message);
  }
};

module.exports = {
  getAllQuizzes,
  createQuiz,
  getQuizById,
  deleteQuizById,
  updateQuizById,
};
