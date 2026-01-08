const express = require("express");
const {
  addCompletedTestSeries,
  getUserCompletedTestSeries,
  getLeaderboard,
  getUserRank,
} = require("../controllers/testSeriesProgressController");

const router = express.Router();

router.post("/complete-test", addCompletedTestSeries); // ✅ Add completed test
router.get("/user-tests/:id", getUserCompletedTestSeries); // ✅ Get user's test history
router.get("/leaderboard", getLeaderboard); // ✅ Get leaderboard
router.get("/rank/:test_series_id/user/:userId",getUserRank)

module.exports = router;
