const mongoose = require("mongoose");

const mangaSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            default: "Unknown"
        },
        coverImageUrl: {
            type: String,
            default: "",
        },
        genres: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Genre",
            }
        ],
        status: {
            type: String,
            enum: ["ongoing", "completed"],
            default: "ongoing",
        },
        uploaderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        followedCount: {
            type: Number,
            default: 0,
        },
        averageRating: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
)

const Manga = mongoose.model("Manga", mangaSchema);
module.exports = Manga;
