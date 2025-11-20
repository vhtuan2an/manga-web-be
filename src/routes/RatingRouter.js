const express = require('express');
const router = express.Router();
const RatingController = require('../controllers/RatingController');
const { authMiddleware } = require('../middlewares/AuthMiddleware');

router.post('/', authMiddleware(['reader', 'uploader', 'admin']), RatingController.rateManga);
router.get('/manga/:mangaId', RatingController.getMangaAverageRating);
router.get('/manga/:mangaId/user', authMiddleware(['reader', 'uploader', 'admin']), RatingController.getUserRatingForManga);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Rating system for manga (1-5 stars)
 */

/**
 * @swagger
 * /api/ratings:
 *   post:
 *     summary: Rate a manga or update existing rating
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
 *                 description: Manga ID to rate
 *                 example: 64f8a1b2c3d4e5f6a7b8c9d0
 *               star:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5 stars
 *                 example: 4
 *     responses:
 *       201:
 *         description: Rating created/updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Rating'
 *       400:
 *         description: Invalid rating data (star must be 1-5)
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/ratings/manga/{mangaId}:
 *   get:
 *     summary: Get average rating and total ratings for a manga
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
 *         description: Average rating and count for the manga
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 averageRating:
 *                   type: number
 *                   format: float
 *                   example: 4.2
 *                   description: Average rating (0 if no ratings)
 *                 totalRatings:
 *                   type: integer
 *                   example: 25
 *                   description: Total number of ratings
 *       500:
 *         description: Internal server error
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
 *         description: User's rating for the manga (null if no rating)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Rating'
 *                     - type: 'null'
 *       401:
 *         description: Authentication required
 */