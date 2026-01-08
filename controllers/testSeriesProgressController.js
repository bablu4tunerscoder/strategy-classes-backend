
const TestSeriesProgress = require("../models/testSeriesProgressModel");

/* ================= ADD / UPDATE COMPLETED TEST SERIES ================= */
const addCompletedTestSeries = async (req, res) => {
  try {
    const {
      guestId,            // optional (guest case)
      testSeries,         // ObjectId (required)
      quizResult,
      score,
      timeTaken,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
    } = req.body;

    // 🔹 Logged-in user from middleware
    const userId = req.user?._id;

    if (!testSeries || !totalQuestions) {
      return res.status(400).json({
        message: "testSeries and totalQuestions are required",
      });
    }

    if (!userId && !guestId) {
      return res.status(400).json({
        message: "User login or guestId required",
      });
    }

    // 🔹 Find progress (user OR guest)
    let progress = await TestSeriesProgress.findOne(
      userId ? { user: userId } : { guestId }
    );

    if (!progress) {
      progress = new TestSeriesProgress({
        user: userId || undefined,
        guestId: guestId || undefined,
        completedTestSeries: [],
      });
    }

    // 🔹 Remove old attempt of same testSeries
    progress.completedTestSeries = progress.completedTestSeries.filter(
      (t) => t.testSeries.toString() !== testSeries.toString()
    );

    // 🔹 Push latest attempt
    progress.completedTestSeries.push({
      testSeries,
      quizResult,
      score,
      timeTaken,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
    });

    progress.totalCompleted = progress.completedTestSeries.length;

    await progress.save();

    res.status(201).json({
      message: "Test series progress saved successfully",
      data: progress,
    });
  } catch (error) {
    console.error("AddCompletedTestSeries Error:", error);
    res.status(500).json({ error: error.message });
  }
};


/* ================= GET USER COMPLETED TEST SERIES ================= */
const getUserCompletedTestSeries = async (req, res) => {
  try {
    const { id } = req.params; // userId

    const progress = await TestSeriesProgress.findOne({ user: id })
      .populate("completedTestSeries.testSeries", "title subject");

    if (!progress || !progress.completedTestSeries.length) {
      return res.json({ completedTestSeries: [] });
    }

    res.status(200).json({
      completedTestSeries: progress.completedTestSeries,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/* ================= LEADERBOARD (AVG SCORE) ================= */
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await TestSeriesProgress.aggregate([
      { $unwind: "$completedTestSeries" },
      {
        $group: {
          _id: "$user",
          totalScore: { $sum: "$completedTestSeries.score" },
          totalTests: { $sum: 1 },
        },
      },
      {
        $addFields: {
          avgScore: { $divide: ["$totalScore", "$totalTests"] },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.name",
          avgScore: 1,
          totalTests: 1,
        },
      },
      { $sort: { avgScore: -1 } },
    ]);

    res.status(200).json({ leaderboard });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/* ================= USER RANK IN A TEST SERIES ================= */
const getUserRank = async (req, res) => {
  try {
    const { userId, testSeriesId } = req.params;

    const progressList = await TestSeriesProgress.find({
      "completedTestSeries.testSeries": testSeriesId,
    });

    const leaderboard = [];

    progressList.forEach((p) => {
      const attempt = p.completedTestSeries.find(
        (t) => t.testSeries.toString() === testSeriesId
      );

      if (attempt) {
        leaderboard.push({
          user: p.user,
          score: attempt.score,
          timeTaken: attempt.timeTaken,
        });
      }
    });

    leaderboard.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeTaken - b.timeTaken;
    });

    const rank = leaderboard.findIndex(
      (u) => u.user?.toString() === userId
    ) + 1;

    if (!rank) {
      return res.status(404).json({ message: "User not attempted" });
    }

    res.status(200).json({
      userId,
      testSeriesId,
      rank,
      totalParticipants: leaderboard.length,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
  addCompletedTestSeries,
  getUserCompletedTestSeries,
  getLeaderboard,
  getUserRank,
};
