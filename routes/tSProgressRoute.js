const express = require("express");
const {
  addCompletedTestSeries,
  getUserCompletedTestSeries,
  getLeaderboard,
  getUserRank,
} = require("../controllers/tSProgressController");

const router = express.Router();

router.post("/complete-test", addCompletedTestSeries); // ✅ Add completed test
router.get("/user-tests/:id", getUserCompletedTestSeries); // ✅ Get user's test history
router.get("/leaderboard", getLeaderboard); // ✅ Get leaderboard
router.get("/:Tseries_id/user/:userId/rank",getUserRank)

module.exports = router;
