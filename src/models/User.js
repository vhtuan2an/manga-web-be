const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["reader", "uploader", "admin"],
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    // for readers
    followedMangas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Manga",
      },
    ],
    readingHistory: [
      {
        manga: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Manga",
        },
        lastReadAt: { type: Date, default: Date.now },
        chapterId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Chapter",
        },
      },
    ],
    // for uploaders
    uploadedMangas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Manga",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);