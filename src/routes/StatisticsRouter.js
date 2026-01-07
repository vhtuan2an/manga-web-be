const express = require('express');
const router = express.Router();
const StatisticsController = require('../controllers/StatisticsController');
const { authMiddleware } = require('../middlewares/AuthMiddleware');

// Basic statistics (public or authenticated)
router.get('/', StatisticsController.getStatistics);

// Detailed statistics (admin only)
router.get('/detailed', authMiddleware(['admin']), StatisticsController.getDetailedStatistics);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Platform statistics and analytics
 */

/**
 * @swagger
 * /api/statistics:
 *   get:
 *     summary: Get platform statistics
 *     description: Returns total counts for users, mangas, uploaders, and reports
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Platform statistics
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
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 1523
 *                           description: Total number of users
 *                         uploaders:
 *                           type: integer
 *                           example: 45
 *                           description: Total number of uploaders
 *                         readers:
 *                           type: integer
 *                           example: 1470
 *                           description: Total number of readers
 *                         admins:
 *                           type: integer
 *                           example: 8
 *                           description: Total number of admins
 *                     mangas:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 342
 *                           description: Total number of mangas
 *                     reports:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 27
 *                           description: Total number of reports
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/statistics/detailed:
 *   get:
 *     summary: Get detailed platform statistics
 *     description: Returns detailed breakdown including manga status, report status, total view count, and top 5 genres (Admin only)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detailed platform statistics
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
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 1523
 *                         uploaders:
 *                           type: integer
 *                           example: 45
 *                         readers:
 *                           type: integer
 *                           example: 1470
 *                         admins:
 *                           type: integer
 *                           example: 8
 *                     mangas:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 342
 *                         totalViewCount:
 *                           type: integer
 *                           example: 15430
 *                         ongoing:
 *                           type: integer
 *                           example: 215
 *                         completed:
 *                           type: integer
 *                           example: 98
 *                         hiatus:
 *                           type: integer
 *                           example: 29
 *                         topGenres:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: Action
 *                               count:
 *                                 type: integer
 *                                 example: 5420
 *                     reports:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 27
 *                         pending:
 *                           type: integer
 *                           example: 12
 *                         resolved:
 *                           type: integer
 *                           example: 15
 *       401:
 *         description: Unauthorized - Admin access required
 *       500:
 *         description: Internal server error
 */