const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        manga: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Manga",
        },
        chapter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chapter",
        },
        content: {
            type: String,
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

commentSchema.pre("validate", function (next) {
    if (!this.manga && !this.chapter) {
        next(new Error("A comment must reference either a manga or a chapter."));
    } else {
        next();
    }
});

module.exports = mongoose.model("Comment", commentSchema);