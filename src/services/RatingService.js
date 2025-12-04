const Rating = require('../models/Rating');
const Manga = require('../models/Manga');
const AuthService = require('./AuthService');
const mongoose = require('mongoose');

class RatingService {
    async rateManga(userId, mangaId, star) {
        if (!userId) {
            return { status: 'error', message: 'User id required' };
        }
        if (!mangaId || typeof star !== 'number') {
            return { status: 'error', message: 'Missing required fields' };
        }
        if (star < 1 || star > 5) {
            return { status: 'error', message: 'Star rating must be between 1 and 5' };
        }

        // Validate user exists and is allowed to rate
        const userResult = await AuthService.getUserById(userId);
        if (userResult.status === 'error') {
            return { status: 'error', message: 'User not found' };
        }
        const user = userResult.data;
        const allowedRoles = ['reader', 'uploader', 'admin'];
        if (!allowedRoles.includes(user.role)) {
            return { status: 'error', message: 'User role not permitted to rate' };
        }

        const rating = await Rating.findOneAndUpdate(
            { user: userId, manga: mangaId },
            { star },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        await this.updateMangaAverageRating(mangaId);

        return { status: 'success', data: rating };
    }

    async getUserRatingForManga(userId, mangaId) {
        const rating = await Rating.findOne({ user: userId, manga: mangaId });
        return {
            status: 'success',
            data: rating
        };
    }

    async getMangaAverageRating(mangaId) {
        try {
            // Convert string to ObjectId if needed
            const objectId = typeof mangaId === 'string' ? new mongoose.Types.ObjectId(mangaId) : mangaId;
            
            const result = await Rating.aggregate([
                { $match: { manga: objectId } },
                { $group: { _id: '$manga', avg: { $avg: '$star' }, count: { $sum: 1 } } }
            ]);
            
            if (result.length === 0) {
                return { status: 'success', average: 0, count: 0 };
            }
            return { status: 'success', average: result[0].avg, count: result[0].count };
        } catch (error) {
            console.error('Error in getMangaAverageRating:', error);
            return { status: 'error', message: 'Failed to get average rating: ' + error.message };
        }
    }

    async updateMangaAverageRating(mangaId) {
        try {
            const avgResult = await this.getMangaAverageRating(mangaId);
            if (avgResult.status === 'success') {
                await Manga.findByIdAndUpdate(mangaId, { averageRating: avgResult.average || 0 });
            }
        } catch (error) {
            console.error('Error updating manga average rating:', error);
        }
    }
}

module.exports = new RatingService();
