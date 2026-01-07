const TestSeriesProgress = require("../models/TSProgressModel");
const PostTestSeries = require("../models/testSeriesModels");

const User = require("../models/userModel");

// ✅ Add or Update Completed Test Series for a User
const addCompletedTestSeries = async (req, res) => {
  try {
    const {
      userId,
      Tseries_id,
      quizResult,
      score,
      timeTaken,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
    } = req.body;

    let userProgress = await TestSeriesProgress.findOne({ userId });

    if (!userProgress) {
      // 🔹 If user progress doesn't exist, create a new entry
      userProgress = new TestSeriesProgress({
        userId,
        completedTestSeries: [],
        totalCompleted: 0,
      });
    }

    // 🔹 Remove old attempt of the same test series (if exists)
    userProgress.completedTestSeries = userProgress.completedTestSeries.filter(
      (test) => test.Tseries_id !== Tseries_id
    );

    // 🔹 Add the new/latest attempt
    userProgress.completedTestSeries.push({
      Tseries_id,
      quizResult,
      completedAt: new Date(),
      score,
      timeTaken,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
    });

    // 🔹 Update totalCompleted count
    userProgress.totalCompleted = userProgress.completedTestSeries.length;

    await userProgress.save();
    res
      .status(201)
      .json({
        message: "Test series progress recorded successfully",
        userProgress,
      });
  } catch (error) {
    console.error("Error recording test series progress:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get User’s Completed Test Series
const getUserCompletedTestSeries = async (req, res) => {
  try {
    const { id } = req.params;

    const userProgress = await TestSeriesProgress.findOne({ userId: id });

    if (!userProgress || !userProgress.completedTestSeries.length) {
      return res.status(200).json({
        message: "User has not completed any test series yet",
        completedTestSeries: [],
      });
    }

    // Fetch additional details (title & subject_name) using aggregation
    const completedTestSeries = await Promise.all(
      userProgress.completedTestSeries.map(async (test) => {
        const seriesDetails = await PostTestSeries.findOne(
          { Tseries_id: test.Tseries_id },
          { title: 1, subject_name: 1, _id: 0 } // Select only required fields
        );

        return {
          ...test.toObject(),
          title: seriesDetails?.title || "Unknown Title",
          subject_name: seriesDetails?.subject_name || "Unknown Subject",
        };
      })
    );

    res.status(200).json({ completedTestSeries });
  } catch (error) {
    console.error("Error fetching user test series:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get Leaderboard Sorted by Latest Average Score
const getLeaderboard = async (req, res) => {
  try {
    // 🔹 Aggregate data from TestSeriesProgress and join with User model
    const leaderboardData = await TestSeriesProgress.aggregate([
      {
        $lookup: {
          from: "users", // The name of the User collection in MongoDB
          localField: "userId",
          foreignField: "userId",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" }, // Convert array to object
      {
        $addFields: {
          totalScore: { $sum: "$completedTestSeries.score" },
          totalTests: { $size: "$completedTestSeries" },
        },
      },
      {
        $addFields: {
          avgScore: {
            $cond: {
              if: { $gt: ["$totalTests", 0] },
              then: { $divide: ["$totalScore", "$totalTests"] },
              else: 0,
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          name: "$userInfo.name",
          totalTests: 1,
          avgScore: 1,
        },
      },
      { $sort: { avgScore: -1 } }, // Sort by highest avgScore
    ]);

    // 🔹 Assign ranks based on sorted position
    const leaderboard = leaderboardData.map((user, index) => ({
      rank: index + 1, // Rank starts from 1
      ...user,
    }));

    res.status(200).json({ leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const getUserRank = async (req, res) => {
  try {
    const { userId, Tseries_id } = req.params;

    // 🔹 Fetch all users who attempted this test series
    const allUsers = await TestSeriesProgress.find({
      "completedTestSeries.Tseries_id": Tseries_id,
    });

    const leaderboard = [];

    // 🔹 Build leaderboard with latest attempts
    allUsers.forEach((user) => {
      const latestAttempt = user.completedTestSeries
        .filter((t) => t.Tseries_id === Tseries_id)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];

      if (latestAttempt) {
        leaderboard.push({
          userId: user.userId,
          score: latestAttempt.score,
          timeTaken: latestAttempt.timeTaken,
          correctAnswers: latestAttempt.correctAnswers,
          incorrectAnswers: latestAttempt.incorrectAnswers,
          skippedQuestions: latestAttempt.skippedQuestions,
          completedAt: latestAttempt.completedAt,
        });
      }
    });

    // 🔹 Sort users by highest score (If same score, sort by fastest time)
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score; // Higher score first
      return a.timeTaken.localeCompare(b.timeTaken); // Faster time first
    });

    // 🔹 Find rank of the requested user
    const userRankIndex = leaderboard.findIndex((u) => u.userId == userId);
    const userRank = userRankIndex === -1 ? null : userRankIndex + 1;

    // 🔹 Find user's latest test attempt
    const userAttempt = leaderboard.find((u) => u.userId == userId);

    if (!userAttempt) {
      return res.status(404).json({
        message: "User has not attempted this test series yet",
      });
    }

    // 🔹 Response with rank & details
    res.status(200).json({
      userId,
      Tseries_id,
      rank: userRank,
      totalParticipants: leaderboard.length,
      score: userAttempt.score,
      correctAnswers: userAttempt.correctAnswers,
      incorrectAnswers: userAttempt.incorrectAnswers,
      skippedQuestions: userAttempt.skippedQuestions,
      timeTaken: userAttempt.timeTaken,
      completedAt: userAttempt.completedAt,
    });
  } catch (error) {
    console.error("Error fetching user rank:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = {
  addCompletedTestSeries,
  getUserCompletedTestSeries,
  getLeaderboard,
  getUserRank,
};
