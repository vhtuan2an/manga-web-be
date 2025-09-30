const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
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
        star: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

ratingSchema.pre("validate", function (next) {
    if (!this.manga) {
        next(new Error("A rating must reference a manga."));
    } else {
        next();
    }
});

module.exports = mongoose.model("Rating", ratingSchema);