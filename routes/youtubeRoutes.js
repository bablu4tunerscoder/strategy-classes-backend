const express = require("express");
const router = express.Router();
const {
  upsertYoutubeVideos,
  getYoutubeVideos,
  deleteYoutubeVideo,
} = require("../controllers/youtubeController");

router.post("/youtube-videos", upsertYoutubeVideos);
router.get("/youtube-videos", getYoutubeVideos);
router.delete("/youtube-videos/:videoId", deleteYoutubeVideo);

module.exports = router;
