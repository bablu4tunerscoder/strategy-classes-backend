const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema(
    {
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },

        selectedOptionId: {
            type: Number,
            required: true,
        },

        isCorrect: {
            type: Boolean,
            required: true,
        },
    },
    { _id: false }
);

const quizAttemptedSchema = new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PostQuiz",
        required: true,
    },

    quizResult: [quizResultSchema],
    score: {
        type: Number,
        required: true,
        default: 0,
    },
    timeTaken: {
        type: Number,
        required: true,
        default: 0,
    },
    attempts: {
        type: Number,
        required: true,
        default: 0,
    },
    totalQuestions: {
        type: Number,
        required: true,
    },
    correctAnswers: {
        type: Number,
        required: true,
        default: 0,
    },
    incorrectAnswers: {
        type: Number,
        required: true,
        default: 0,
    },
    skippedQuestions: {
        type: Number,
        required: true,
        default: 0,
    },
    attemptDate: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });


module.exports = { quizAttemptedSchema }