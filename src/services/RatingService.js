
const Rating = require('../models/Rating');
const Manga = require('../models/Manga');
const AuthService = require('./AuthService');

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
        return await Rating.findOne({ user: userId, manga: mangaId });
    }

    async getMangaAverageRating(mangaId) {
        const result = await Rating.aggregate([
            { $match: { manga: typeof mangaId === 'string' ? require('mongoose').Types.ObjectId(mangaId) : mangaId } },
            { $group: { _id: '$manga', avg: { $avg: '$star' }, count: { $sum: 1 } } }
        ]);
        if (result.length === 0) {
            return { status: 'success', average: 0, count: 0 };
        }
        return { status: 'success', average: result[0].avg, count: result[0].count };
    }

    async updateMangaAverageRating(mangaId) {
        const avgResult = await this.getMangaAverageRating(mangaId);
        await Manga.findByIdAndUpdate(mangaId, { averageRating: avgResult.average || 0 });
    }
}

module.exports = new RatingService();
