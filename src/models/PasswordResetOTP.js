const mongoose = require("mongoose");

const passwordResetOTPSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            index: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Auto-delete expired OTPs
passwordResetOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetOTP = mongoose.model("PasswordResetOTP", passwordResetOTPSchema);
module.exports = PasswordResetOTP;
