const YoutubeVideos = require("../models/youtubeVideos");


exports.upsertYoutubeVideos = async (req, res) => {
  try {
    const { videos } = req.body;

    // Validation
    if (!Array.isArray(videos) || videos.length < 1 || videos.length > 4) {
      return res.status(400).json({
        message: "Please provide between 1 and 4 videos",
      });
    }

    const processedVideos = videos.filter(
      (v) => v.videoId && v.thumbnail
    );

    if (processedVideos.length === 0) {
      return res.status(400).json({
        message: "Each video must contain videoId and thumbnail",
      });
    }

    const doc = await YoutubeVideos.findById("singleton");

    if (doc) {
      doc.videos = processedVideos;
      await doc.save();
    } else {
      await YoutubeVideos.create({
        _id: "singleton",
        videos: processedVideos,
      });
    }

    res.status(200).json({
      message: "Youtube videos updated successfully",
      videos: processedVideos,
    });
  } catch (error) {
    console.error("Youtube upsert error:", error);
    res.status(500).json({
      message: "Error updating youtube videos",
      error: error.message,
    });
  }
};


exports.getYoutubeVideos = async (req, res) => {
  try {
    const doc = await YoutubeVideos.findById("singleton");

    if (!doc || doc.videos.length === 0) {
      return res.status(404).json({
        message: "No youtube videos found",
      });
    }

    res.status(200).json({
      videos: doc.videos,
    });
  } catch (error) {
    console.error("Fetch youtube videos error:", error);
    res.status(500).json({
      message: "Error fetching youtube videos",
      error: error.message,
    });
  }
};

exports.deleteYoutubeVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const doc = await YoutubeVideos.findById("singleton");
    if (!doc) {
      return res.status(404).json({
        message: "Youtube video document not found",
      });
    }

    const beforeLength = doc.videos.length;
    doc.videos = doc.videos.filter(
      (video) => video.videoId !== videoId
    );

    if (beforeLength === doc.videos.length) {
      return res.status(404).json({
        message: "Video not found",
      });
    }

    await doc.save();

    res.status(200).json({
      message: "Video deleted successfully",
      videos: doc.videos,
    });
  } catch (error) {
    console.error("Delete youtube video error:", error);
    res.status(500).json({
      message: "Error deleting youtube video",
      error: error.message,
    });
  }
};
