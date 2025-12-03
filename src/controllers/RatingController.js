const RatingService = require('../services/RatingService');

class RatingController {
    async rateManga(req, res) {
        try {
            const userId = req.id;
            const { manga, star } = req.body;
            if (!userId) {
                return res.status(401).json({ status: 'error', message: 'Authentication required' });
            }
            const result = await RatingService.rateManga(userId, manga, star);
            if (result.status === 'error') {
                return res.status(400).json(result);
            }
            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async getMangaAverageRating(req, res) {
        try {
            const { mangaId } = req.params;
            const result = await RatingService.getMangaAverageRating(mangaId);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async getUserRatingForManga(req, res) {
        try {
            const userId = req.id;
            const { mangaId } = req.params;
            if (!userId) {
                return res.status(401).json({ status: 'error', message: 'Authentication required' });
            }
            const rating = await RatingService.getUserRatingForManga(userId, mangaId);
            return res.json({ status: 'success', data: rating });
        } catch (error) {
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }
}

module.exports = new RatingController();