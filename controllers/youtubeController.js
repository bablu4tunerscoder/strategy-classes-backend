const { v4: uuidv4 } = require("uuid");
const YoutubeVideos = require("../models/youtubeVideos");

// Create video object with UUID
const createVideoObject = (video) => ({
  id: uuidv4(),
  thumbnail: video.thumbnail,
});

// ➕ Insert or Update videos
exports.upsertYoutubeVideos = async (req, res) => {
  const { latestVideos } = req.body; // frontend is now sending single array named latestVideos

  if (!Array.isArray(latestVideos) || latestVideos.length < 1 || latestVideos.length > 4) {
    return res.status(400).json({
      message: "Please send between 1 and 4 videos",
    });
  }

  const processedVideos = latestVideos
    .filter(v => v.thumbnail)
    .map(createVideoObject);

  if (processedVideos.length === 0) {
    return res.status(400).json({
      message: "No valid videos found with 'thumbnail'",
    });
  }

  try {
    const doc = await YoutubeVideos.findOne();

    if (doc) {
      doc.videos = processedVideos;
      await doc.save();
    } else {
      await YoutubeVideos.create({
        videos: processedVideos,
      });
    }

    res.status(200).json({ message: "Videos updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating videos", error });
  }
};

// 👁️ Get all videos
exports.getYoutubeVideos = async (req, res) => {
  try {
    const doc = await YoutubeVideos.findOne();
    if (!doc) return res.status(404).json({ message: "No videos found" });

    res.json({ videos: doc.videos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching videos", error });
  }
};

// ❌ Delete a video by UUID
exports.deleteYoutubeVideo = async (req, res) => {
  const { videoId } = req.params;

  try {
    const doc = await YoutubeVideos.findOne();
    if (!doc) return res.status(404).json({ message: "No document found" });

    const beforeCount = doc.videos.length;
    doc.videos = doc.videos.filter((v) => v.id !== videoId);
    const afterCount = doc.videos.length;

    if (beforeCount === afterCount) {
      return res.status(404).json({ message: "Video ID not found" });
    }

    await doc.save();
    res.json({ message: "Video removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting video", error });
  }
};
