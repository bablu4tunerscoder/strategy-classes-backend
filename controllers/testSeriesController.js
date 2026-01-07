const {
  getAllQuizzes,
  getQuizById,
  deleteQuizById,
  updateQuizById,
} = require("../services/testSeriesService");
const Postquiz = require("../models/testSeriesModels");

const path = require("path");

const getQuizzes = async (req, res) => {
  try {
    const quizzes = await getAllQuizzes();
    res.status(200).json({
      message: "All Quizzes Fetched Successfully",
      data: quizzes,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createNewQuiz = async (req, res) => {
  try {
    const {
      title,
      subject_id,
      subject_name,
      topic,
      questionArray,
      paid,
      price,
      negativeMarking,
      negativeMarkingValue,
      duration,
    } = req.body;

    // Validate required fields
    if (!title || !subject_id || !duration) {
      return res.status(400).json({
        error: "Missing required fields",
        requiredFields: ["title", "subject_id", "duration"],
      });
    }

    // Process Thumbnail
    const thumbnailFile = req.files?.["thumbnail"]?.[0];
    if (!thumbnailFile) {
      return res.status(400).json({ error: "Thumbnail is required" });
    }

    const thumbnail = {
      public_id: thumbnailFile.filename,
      secure_url: path.relative(__dirname, thumbnailFile.path),
    };

    // Validate questionArray if provided
    if (questionArray) {
      try {
        JSON.parse(questionArray); // Ensure it's a valid JSON array
      } catch (err) {
        return res.status(400).json({
          error: "Invalid questionArray format. Must be a valid JSON array.",
        });
      }
    }

    // Create a new quiz
    const quiz = new Postquiz({
      Tseries_id: Date.now().toString(),
      subject_id,
      subject_name,
      topic,
      questionArray: questionArray ? JSON.parse(questionArray) : [],
      title,
      thumbnail,
      paid: paid || false,
      price: price || 0,
      negativeMarking: negativeMarking || false,
      negativeMarkingValue : negativeMarkingValue || 0,
      duration,
    });

    await quiz.save();

    res.status(201).json({
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (err) {
    console.error("Error creating quiz:", err);
    res.status(500).json({
      error: "An error occurred while creating the quiz",
      details: err.message,
    });
  }
};

const getQuizByIdController = async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await getQuizById(quizId);
    res.status(200).json({
      message: "Fetched Quiz Successfully",
      data: quiz,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
    console.log(err);
  }
};

const deleteQuizByIdController = async (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = await deleteQuizById(quizId);
    res.status(200).json({
      message: `Quiz with ${quizId} Deleted successfully`,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const {
      title,
      subject_id,
      subject_name,
      topic,
      questionArray,
      paid,
      price,
      negativeMarking,
      negativeMarkingValue,
      duration,
    } = req.body;

    // Validate required fields (optional: you can adjust according to your needs)
    if (!quiz_id) {
      return res.status(400).json({ error: "quiz_id is required" });
    }

    // Fetch the existing quiz
    const quiz = await Postquiz.findOne({ Tseries_id: quiz_id });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Update fields if new data is provided, otherwise keep existing values
    if (title) quiz.title = title;
    if (subject_id) quiz.subject_id = subject_id;
    if (subject_name) quiz.subject_name = subject_name;

    if (topic) quiz.topic = topic;

    if (questionArray) {
      try {
        quiz.questionArray = JSON.parse(questionArray); // Ensure it's a valid JSON array
      } catch (err) {
        return res.status(400).json({
          error: "Invalid questionArray format. Must be a valid JSON array.",
        });
      }
    }

    if (paid !== undefined) quiz.paid = paid; // Handle paid (could be a boolean)
    if (price !== undefined) quiz.price = price; // Handle price (could be a number)
    if (negativeMarking !== undefined) quiz.negativeMarking = negativeMarking; // Handle negativeMarking (could be a boolean)
    if (negativeMarkingValue != undefined)
      quiz.negativeMarkingValue = negativeMarkingValue;
    if (duration !== undefined) quiz.duration = duration; // Handle duration

    // Process Thumbnail (only if a new one is provided)
    const thumbnailFile = req.files?.["thumbnail"]?.[0];
    if (thumbnailFile) {
      const thumbnail = {
        public_id: thumbnailFile.filename,
        secure_url: path.relative(__dirname, thumbnailFile.path),
      };
      quiz.thumbnail = thumbnail; // Update thumbnail if provided
    }

    // Save updated quiz
    await quiz.save();

    res.status(200).json({
      message: "Quiz updated successfully",
      data: quiz,
    });
  } catch (err) {
    console.error("Error updating quiz:", err);
    res.status(500).json({
      error: "An error occurred while updating the quiz",
      details: err.message,
    });
  }
};

const getSeriesWithSubjectId = async (req, res) => {
  try {
    const { id } = req.params;

    // Find quizzes with the specified course_id
    const quizzes = await Postquiz.find({ subject_id : id });

    if (quizzes.length === 0) {
      return res.status(404).json({
        Status: "0",
        message: "No series found for the given subject_id",
      });
    }

    res.status(200).json({
      Status: "1",
      message: "Series With Subject Id  retrieved successfully",
      data: quizzes,
    });
  } catch (error) {
    console.error("Error fetching subject:", error);
    res.status(500).json({
      Status: "0",
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  getQuizzes,
  createNewQuiz,
  getQuizByIdController,
  deleteQuizByIdController,
  updateQuiz,
  getSeriesWithSubjectId,
};
