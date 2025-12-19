const User = require('../models/User');
const PasswordResetOTP = require('../models/PasswordResetOTP');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiErrorUtils');
const EmailService = require('./EmailService');

class AuthService {
    async register(userData) {
        const { username, email, password, confirmPassword, role, avatarUrl } = userData;
        if (password !== confirmPassword) {
            throw new ApiError(400, 'Passwords do not match');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            throw new ApiError(409, 'User with this email or username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'reader',
            avatarUrl: avatarUrl || ''
        });

        await newUser.save();

        // Generate JWT token
        const accessToken = jwt.sign(
            { 
                id: newUser._id, 
                email: newUser.email, 
                role: newUser.role 
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        // Return user without password
        const userResponse = {
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            avatarUrl: newUser.avatarUrl,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt
        };

        return {
            status: 'success',
            data: {
                user: userResponse,
                accessToken
            }
        };
    }

    async login(email, password) {
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            throw new ApiError(401, 'Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            throw new ApiError(401, 'Invalid email or password');
        }

        // Generate JWT token
        const accessToken = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                role: user.role 
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        // Return user without password
        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        return {
            status: 'success',
            data: {
                user: userResponse,
                accessToken
            }
        };
    }

    async getUserInfo(userId) {
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        return {
            status: 'success',
            data: user
        };
    }

    // Generate 6-digit OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async forgotPassword(email) {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            throw new ApiError(404, 'Không tìm thấy tài khoản với email này');
        }

        // Delete any existing OTPs for this email
        await PasswordResetOTP.deleteMany({ email });

        // Generate new OTP
        const otp = this.generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to database
        const otpRecord = new PasswordResetOTP({
            email,
            otp,
            expiresAt,
            verified: false
        });
        await otpRecord.save();

        // Send OTP via email
        await EmailService.sendOTPEmail(email, otp);

        return {
            status: 'success',
            message: 'Mã OTP đã được gửi đến email của bạn'
        };
    }

    async verifyOTP(email, otp) {
        // Find OTP record
        const otpRecord = await PasswordResetOTP.findOne({
            email,
            otp,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            throw new ApiError(400, 'Mã OTP không hợp lệ hoặc đã hết hạn');
        }

        // Mark as verified
        otpRecord.verified = true;
        await otpRecord.save();

        return {
            status: 'success',
            message: 'Xác thực OTP thành công'
        };
    }

    async resetPassword(email, otp, newPassword, confirmPassword) {
        // Validate passwords match
        if (newPassword !== confirmPassword) {
            throw new ApiError(400, 'Mật khẩu xác nhận không khớp');
        }

        // Validate password length
        if (newPassword.length < 6) {
            throw new ApiError(400, 'Mật khẩu phải có ít nhất 6 ký tự');
        }

        // Find verified OTP record
        const otpRecord = await PasswordResetOTP.findOne({
            email,
            otp,
            verified: true,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            throw new ApiError(400, 'OTP chưa được xác thực hoặc đã hết hạn');
        }

        // Find user and update password
        const user = await User.findOne({ email });
        if (!user) {
            throw new ApiError(404, 'Không tìm thấy tài khoản');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        // Delete used OTP
        await PasswordResetOTP.deleteMany({ email });

        return {
            status: 'success',
            message: 'Đặt lại mật khẩu thành công'
        };
    }
}

module.exports = new AuthService();

