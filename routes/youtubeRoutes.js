const express = require("express");
const router = express.Router();
const {

  getYoutubeVideos,

} = require("../controllers/youtubeController");


router.get("/youtube-videos", getYoutubeVideos);

module.exports = router;
