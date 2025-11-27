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

/**
 * @swagger
 * /api/ratings:
 *   post:
 *     summary: Rate a manga
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - manga
 *               - star
 *             properties:
 *               manga:
 *                 type: string
 *                 description: Manga ID
 *               star:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5 stars
 *     responses:
 *       201:
 *         description: Rating created/updated successfully
 *       400:
 *         description: Invalid rating data
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/ratings/manga/{mangaId}:
 *   get:
 *     summary: Get average rating for a manga
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: mangaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga ID
 *     responses:
 *       200:
 *         description: Average rating and count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 averageRating:
 *                   type: number
 *                 totalRatings:
 *                   type: integer
 */

/**
 * @swagger
 * /api/ratings/manga/{mangaId}/user:
 *   get:
 *     summary: Get current user's rating for a manga
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mangaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga ID
 *     responses:
 *       200:
 *         description: User's rating for the manga
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Rating'
 *       401:
 *         description: Authentication required
 */