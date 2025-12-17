const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiErrorUtils');

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
}

module.exports = new AuthService();
