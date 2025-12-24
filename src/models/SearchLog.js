const mongoose = require("mongoose");

const searchLogSchema = new mongoose.Schema(
    {
        query: {
            type: String,
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null, // null = anonymous user
        },
        resultCount: {
            type: Number,
            default: 0,
        },
        clickedMangaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Manga",
            default: null,
        },
        clickPosition: {
            type: Number, // Position trong kết quả (1-indexed)
            default: null,
        },
        sessionId: {
            type: String, // Để track anonymous users
            default: null,
        },
        searchType: {
            type: String,
            enum: ["query", "click"], // query = search, click = clicked result
            default: "query",
        },
    },
    { timestamps: true }
);

// Index cho analytics queries
searchLogSchema.index({ createdAt: -1 });
searchLogSchema.index({ query: 1, clickedMangaId: 1 });

const SearchLog = mongoose.model("SearchLog", searchLogSchema);
module.exports = SearchLog;
