const AuthService = require('./AuthService');
const User = require('../models/User');
const Manga = require('../models/Manga');

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
                data: {
                    users: users,
                    pagination: {
                        currentPage: page,
                        totalPages: Math.ceil(total / limit),
                        totalItems: total,
                        itemsPerPage: limit,
                        hasNextPage: page < Math.ceil(total / limit),
                        hasPrevPage: page > 1
                    }
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
        const user = await User.findById(id);
        const isFollowing = user.followedMangas.some(
            manga => manga.toString() === mangaId.toString()
        );
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $addToSet: { followedMangas: mangaId } },
            { new: true }
        );
        if (!isFollowing) {
            await Manga.findByIdAndUpdate(
                mangaId,
                { $inc: { followedCount: 1 } }
            );
        }

        return {
            status: 'success',
            data: updatedUser,
            message: 'Manga followed successfully'
        };
    }

    async unfollowManga(id, mangaId) {
        const user = await User.findById(id);
        const isFollowing = user.followedMangas.some(
            manga => manga.toString() === mangaId.toString()
        );
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $pull: { followedMangas: mangaId } },
            { new: true }
        );
        if (isFollowing) {
            await Manga.findByIdAndUpdate(
                mangaId,
                { $inc: { followedCount: -1 } }
            );
            // followedCount >= 0
            await Manga.updateOne(
                { _id: mangaId, followedCount: { $lt: 0 } },
                { $set: { followedCount: 0 } }
            );
        }

        return {
            status: 'success',
            data: updatedUser,
            message: 'Manga unfollowed successfully'
        };
    }

    async unfollowMangaBatch(userId, mangaIds) {
        // Validate that mangaIds is a non-empty array
        if (!Array.isArray(mangaIds) || mangaIds.length === 0) {
            throw new Error('mangaIds must be a non-empty array');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Filter to get only manga IDs that user is actually following
        const followedMangaStrings = user.followedMangas.map(m => m.toString());
        const validMangaIds = mangaIds.filter(id => followedMangaStrings.includes(id.toString()));

        if (validMangaIds.length === 0) {
            return {
                status: 'success',
                message: 'No manga to unfollow',
                data: {
                    unfollowedCount: 0,
                    user: user
                }
            };
        }

        // Remove all valid manga IDs from user's followedMangas
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { followedMangas: { $in: validMangaIds } } },
            { new: true }
        );

        // Decrement followedCount for each affected manga
        await Manga.updateMany(
            { _id: { $in: validMangaIds } },
            { $inc: { followedCount: -1 } }
        );

        // Ensure followedCount doesn't go below 0
        await Manga.updateMany(
            { _id: { $in: validMangaIds }, followedCount: { $lt: 0 } },
            { $set: { followedCount: 0 } }
        );

        return {
            status: 'success',
            message: `Successfully unfollowed ${validMangaIds.length} manga(s)`,
            data: {
                unfollowedCount: validMangaIds.length,
                user: updatedUser
            }
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
        const Chapter = require('../models/Chapter');
        
        const user = await User.findById(id)
            .populate({
                path: 'readingHistory.manga',
                select: 'title coverImage status chapterCount genres',
                populate: {
                    path: 'genres',
                    select: 'name'
                }
            })
            .populate({
                path: 'readingHistory.chapterId',
                select: 'chapterNumber title'
            });

        if (!user) {
            return {
                status: 'error',
                message: 'User not found'
            };
        }

        // Filter valid entries
        const validHistory = user.readingHistory.filter(h => h.manga && h.chapterId);

        // Get unique manga IDs (already ObjectIds from populated data)
        const mangaIds = [...new Set(validHistory.map(h => h.manga._id))];

        // Query minimum chapter number for each manga in one aggregation
        const minChapters = await Chapter.aggregate([
            { $match: { mangaId: { $in: mangaIds } } },
            { $group: { _id: '$mangaId', minChapter: { $min: '$chapterNumber' } } }
        ]);

        // Create a map for quick lookup
        const minChapterMap = {};
        minChapters.forEach(item => {
            minChapterMap[item._id.toString()] = item.minChapter;
        });

        // Sort by lastReadAt (most recent first) and format the response
        const formattedHistory = validHistory
            .sort((a, b) => new Date(b.lastReadAt) - new Date(a.lastReadAt))
            .map(h => {
                const minChapter = minChapterMap[h.manga._id.toString()] || 0;
                const totalChapters = h.manga.chapterCount || 0;
                const currentChapter = h.chapterId.chapterNumber;
                
                // Calculate progress: (current - min + 1) / total * 100
                // E.g., chapters 0,1 (min=0, total=2): chapter 1 = (1-0+1)/2 = 100%
                // E.g., chapters 1,2,3 (min=1, total=3): chapter 2 = (2-1+1)/3 = 66%
                const progress = totalChapters > 0 
                    ? Math.min(100, Math.round(((currentChapter - minChapter + 1) / totalChapters) * 100))
                    : 0;

                return {
                    manga: {
                        _id: h.manga._id,
                        title: h.manga.title,
                        coverImage: h.manga.coverImage,
                        status: h.manga.status,
                        totalChapters: totalChapters,
                        genres: h.manga.genres
                    },
                    currentChapter: {
                        _id: h.chapterId._id,
                        chapterNumber: currentChapter,
                        title: h.chapterId.title
                    },
                    lastReadAt: h.lastReadAt,
                    progress: progress
                };
            });

        return {
            status: 'success',
            data: formattedHistory
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
                        { path: 'uploaderId', select: 'username avatarUrl' },
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