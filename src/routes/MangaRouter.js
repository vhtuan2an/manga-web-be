const MangaController = require('../controllers/MangaController');
const express = require('express');
const { authMiddleware } = require('../middlewares/AuthMiddleware');
const { optionalAuthMiddleware } = require('../middlewares/OptionalAuthMiddleware');
const { uploadSingle } = require('../middlewares/UploadMiddlewares');
const { checkMangaOwnership } = require('../middlewares/CheckMangaOwnership');
const router = express.Router();


router.post('/', authMiddleware(['uploader']), uploadSingle, MangaController.createManga);
router.get('/', MangaController.getMangaList);
router.get('/search', optionalAuthMiddleware, MangaController.searchManga);
router.get('/:id', MangaController.getMangaById);
router.put('/:id', authMiddleware(['admin', 'uploader']), uploadSingle, checkMangaOwnership, MangaController.updateManga);
router.delete('/:id', authMiddleware(['admin', 'uploader']), checkMangaOwnership, MangaController.deleteManga);
router.get('/:mangaId/chapters', MangaController.getChapterList);
router.get('/:id/recommendations', MangaController.getRecommendations);
router.get('/count/genre/:genreId', MangaController.getMangaCountByGenre);

module.exports = router;


/**
 * @swagger
 * tags:
 *   name: Manga
 *   description: Manga management and browsing endpoints
 */

/**
 * @swagger
 * /api/mangas:
 *   post:
 *     summary: Create a new manga
 *     tags: [Manga]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *                 description: Manga title
 *               description:
 *                 type: string
 *                 description: Manga description
 *               author:
 *                 type: string
 *                 description: Manga author
 *               genres:
 *                 type: string
 *                 description: Genre IDs (JSON array or comma-separated)
 *               status:
 *                 type: string
 *                 enum: [ongoing, completed, hiatus]
 *                 default: ongoing
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Cover image file
 *     responses:
 *       201:
 *         description: Manga created successfully
 *       422:
 *         description: Validation error
 *       401:
 *         description: Authentication required (uploader role)
 */

/**
 * @swagger
 * /api/mangas:
 *   get:
 *     summary: Get list of mangas
 *     tags: [Manga]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ongoing, completed, hiatus]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or author
 *     responses:
 *       200:
 *         description: List of mangas with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Manga'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 */

/**
 * @swagger
 * /api/mangas/search:
 *   get:
 *     summary: Search and filter mangas
 *     description: Comprehensive search API supporting search by title/author, filter by status/genres, and various sorting options
 *     tags: [Manga]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by manga title or author name (case-insensitive)
 *         example: "Naruto"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ongoing, completed]
 *         description: Filter by manga status
 *         example: "ongoing"
 *       - in: query
 *         name: genres
 *         schema:
 *           type: string
 *         description: Filter by genre IDs (comma-separated for multiple genres)
 *         example: "64f8a1b2c3d4e5f6a7b8c9d0,64f8a1b2c3d4e5f6a7b8c9d1"
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, oldest, mostViewed, highestRating, mostFollowed, az, za, updated]
 *           default: newest
 *         description: |
 *           Sort options:
 *           - newest: Mới nhất (newest first)
 *           - oldest: Cũ nhất (oldest first)
 *           - mostViewed: Xem nhiều nhất (most viewed)
 *           - highestRating: Đánh giá cao nhất (highest rating)
 *           - mostFollowed: Theo dõi nhiều nhất (most followed)
 *           - az: A-Z (alphabetical ascending)
 *           - za: Z-A (alphabetical descending)
 *           - updated: Cập nhật gần đây (recently updated)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Search results with pagination and applied filters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     mangas:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Manga'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         totalItems:
 *                           type: integer
 *                           example: 100
 *                         limit:
 *                           type: integer
 *                           example: 20
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Failed to search manga
 */


/**
 * @swagger
 * /api/mangas/{id}:
 *   get:
 *     summary: Get manga by ID
 *     tags: [Manga]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga ID
 *     responses:
 *       200:
 *         description: Manga information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Manga'
 *       404:
 *         description: Manga not found
 */

/**
 * @swagger
 * /api/mangas/{id}:
 *   put:
 *     summary: Update manga
 *     tags: [Manga]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               author:
 *                 type: string
 *               genres:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ongoing, completed, hiatus]
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Manga updated successfully
 *       401:
 *         description: Authentication required (uploader role)
 *       403:
 *         description: Not authorized to update this manga
 *       404:
 *         description: Manga not found
 */

/**
 * @swagger
 * /api/mangas/{id}:
 *   delete:
 *     summary: Delete manga
 *     tags: [Manga]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga ID
 *     responses:
 *       200:
 *         description: Manga deleted successfully
 *       401:
 *         description: Authentication required (admin or uploader role)
 *       403:
 *         description: Not authorized to delete this manga
 *       404:
 *         description: Manga not found
 */

/**
 * @swagger
 * /api/mangas/{mangaId}/chapters:
 *   get:
 *     summary: Get chapters for a manga
 *     tags: [Manga]
 *     parameters:
 *       - in: path
 *         name: mangaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga ID
 *     responses:
 *       200:
 *         description: List of chapters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chapter'
 *       404:
 *         description: Manga not found
 */

/**
 * @swagger
 * /api/mangas/count/genre/{genreId}:
 *   get:
 *     summary: Get manga count by genre
 *     tags: [Manga]
 *     parameters:
 *       - in: path
 *         name: genreId
 *         required: true
 *         schema:
 *           type: string
 *         description: Genre ID
 *         example: 64f8a1b2c3d4e5f6a7b8c9d0
 *     responses:
 *       200:
 *         description: Manga count for the genre
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     genreId:
 *                       type: string
 *                       example: 64f8a1b2c3d4e5f6a7b8c9d0
 *                     genreName:
 *                       type: string
 *                       example: Action
 *                     count:
 *                       type: integer
 *                       example: 125
 *       404:
 *         description: Genre not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Genre not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/mangas/{id}/recommendations:
 *   get:
 *     summary: Get manga recommendations
 *     description: Get recommended manga based on what other users read after this manga (collaborative filtering). Falls back to genre-based recommendations if insufficient data.
 *     tags: [Manga]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga ID to get recommendations for
 *         example: 64f8a1b2c3d4e5f6a7b8c9d0
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of recommendations to return
 *     responses:
 *       200:
 *         description: List of recommended manga
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     manga:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         title:
 *                           type: string
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Manga'
 *                     totalRecommendations:
 *                       type: integer
 *                       example: 10
 *       404:
 *         description: Manga not found
 */