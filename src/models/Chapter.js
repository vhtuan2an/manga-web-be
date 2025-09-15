const mongoose = require("mongoose");

const ChapterSchema = new mongoose.Schema(
  {
    mangaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manga",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    pages: [{
        pageNumber: { type: Number, required: true },
        image: { type: String, required: true }
    }],
    chapterNumber: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Chapter = mongoose.model("Chapter", ChapterSchema);
module.exports = Chapter;
