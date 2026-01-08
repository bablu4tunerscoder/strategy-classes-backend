const express = require("express");
const {
  addCompletedTestSeries,
  getUserCompletedTestSeries,
  getLeaderboard,
  getUserRank,
} = require("../../controllers/testSeriesProgressController");
const { authCheck,permissionCheck } = require("../../middlewares/middleware");

const router = express.Router();

router.post("/complete-test",authCheck,permissionCheck("test-series"), addCompletedTestSeries); // ✅ Add completed test
router.get("/user-tests/:id",authCheck,permissionCheck("test-series"), getUserCompletedTestSeries); 
router.get("/leaderboard",authCheck,permissionCheck("test-series"), getLeaderboard); // ✅ Get leaderboard
router.get("/rank/:test_series_id/user/:userId",authCheck,permissionCheck("test-series"), getUserRank)

module.exports = router;
