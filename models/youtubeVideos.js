

const mongoose = require("mongoose");

const videoObjectSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  thumbnail: { type: String }
}, { _id: false });

const youtubeVideoSchema = new mongoose.Schema({
  _id: { type: String, default: "singleton" },
  videos: [videoObjectSchema]
}, { timestamps: true });

module.exports = mongoose.model("YoutubeVideos", youtubeVideoSchema);
