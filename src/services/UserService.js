const AuthService = require('./AuthService');
const User = require('../models/User');

class UserService {
    async getAllUsers(filter = {}) {
        try {
            const page = parseInt(filter.page) || 1;
            const limit = parseInt(filter.limit) || 10;
            const skip = (page - 1) * limit;

            // Build query
            const query = {};

            // Optional: Add search/filter by role
            if (filter.role) {
                query.role = filter.role;
            }

            // Optional: Add search by username or email
            if (filter.search) {
                query.$or = [
                    { username: { $regex: filter.search, $options: 'i' } },
                    { email: { $regex: filter.search, $options: 'i' } }
                ];
            }

            // Get users with pagination
            const users = await User.find(query)
                .select('-password') // Exclude password field
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }); // Most recent first

            // Get total count
            const total = await User.countDocuments(query);

            return {
                status: 'success',
                data: users,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit,
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPrevPage: page > 1
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async getUserById(id) {
        const user = await User.findById(id).select('-password');
        return {
            status: 'success',
            data: user
        };
    }

    async createUser(data) {
        const userData = { ...data };
        if (!userData.confirmPassword && userData.password) {
            userData.confirmPassword = userData.password;
        }
        const result = await AuthService.register(userData);
        if (result.status === 'success') {
            const user = result.data.user;
            return {
                status: 'success',
                data: { ...user._doc, password: undefined }
            };
        } else {
            throw new Error(result.message);
        }
    }

    async updateUser(id, updates) {
        const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
        return {
            status: 'success',
            data: user
        };
    }

    async deleteUser(id) {
        await User.findByIdAndDelete(id);
        return {
            status: 'success',
            message: 'User deleted successfully'
        };
    }

    async followManga(id, mangaId) {
        const user = await User.findByIdAndUpdate(
            id,
            { $addToSet: { followedMangas: mangaId } },
            { new: true }
        );
        return {
            status: 'success',
            data: user
        };
    }

    async unfollowManga(id, mangaId) {
        const user = await User.findByIdAndUpdate(
            id,
            { $pull: { followedMangas: mangaId } },
            { new: true }
        );
        return {
            status: 'success',
            data: user
        };
    }

    async updateReadingHistory(id, manga, chapterId) {
        const user = await User.findById(id);
        if (!user) return null;
        user.readingHistory = user.readingHistory.filter(h => h.manga.toString() !== manga);
        user.readingHistory.push({ manga, chapterId, lastReadAt: new Date() });
        await user.save();
        return {
            status: 'success',
            data: user
        };
    }

    async getReadingHistory(id) {
        const user = await User.findById(id).select('readingHistory');
        return {
            status: 'success',
            data: user ? user.readingHistory : null
        };
    }

    async getUploadedMangas(id) {
        const user = await User.findById(id).populate('uploadedMangas');
        return {
            status: 'success',
            data: user ? user.uploadedMangas : null
        };
    }

    async getFollowedMangas(userId) {
        try {
            const user = await User.findById(userId)
                .populate({
                    path: 'followedMangas',
                    populate: [
                        { path: 'uploader', select: 'username avatarUrl' },
                        { path: 'genres', select: 'name' }
                    ]
                });
            if (!user) {
                throw new Error('User not found');
            }
            return {
                status: 'success',
                data: user.followedMangas
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new UserService();