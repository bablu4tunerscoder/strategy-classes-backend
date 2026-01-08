const express = require("express");
const router = express.Router();
const {
  upsertYoutubeVideos,
  getYoutubeVideos,
  deleteYoutubeVideo,
} = require("../../controllers/youtubeController");
const { authCheck,permissionCheck } = require("../../middlewares/middleware");

router.post("/youtube-videos",authCheck,permissionCheck("youtube"), upsertYoutubeVideos);
router.get("/youtube-videos", authCheck,permissionCheck("youtube"),getYoutubeVideos);
router.delete("/youtube-videos/:videoId",authCheck,permissionCheck("youtube"), deleteYoutubeVideo);

module.exports = router;
