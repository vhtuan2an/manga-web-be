const express = require("express");
const SearchLogController = require("../controllers/SearchLogController");
const { authMiddleware } = require("../middlewares/AuthMiddleware");
const { optionalAuthMiddleware } = require("../middlewares/OptionalAuthMiddleware");

const router = express.Router();

// Public endpoint - log search result clicks (works for both logged in and anonymous users)
router.post("/click", optionalAuthMiddleware, SearchLogController.logClick);

// Admin only - analytics and training data
router.get("/popular", authMiddleware(["admin"]), SearchLogController.getPopularQueries);
router.get("/training-data", authMiddleware(["admin"]), SearchLogController.getTrainingData);
router.get("/training-data/csv", authMiddleware(["admin"]), SearchLogController.exportTrainingDataCSV);
router.get("/full-training-data", authMiddleware(["admin"]), SearchLogController.getFullTrainingData);
router.get("/zero-results", authMiddleware(["admin"]), SearchLogController.getZeroResultQueries);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: SearchLog
 *   description: Search logging for ML training data collection
 */

/**
 * @swagger
 * /api/search-logs/click:
 *   post:
 *     summary: Log a click on search result
 *     description: Track when a user clicks on a manga from search results. Used for training search ranking model.
 *     tags: [SearchLog]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *               - mangaId
 *             properties:
 *               query:
 *                 type: string
 *                 description: The search query that was used
 *                 example: "naruto"
 *               mangaId:
 *                 type: string
 *                 description: ID of the clicked manga
 *               position:
 *                 type: integer
 *                 description: Position of the manga in search results (1-indexed)
 *                 example: 3
 *     responses:
 *       201:
 *         description: Click logged successfully
 *       400:
 *         description: Missing required fields
 */

/**
 * @swagger
 * /api/search-logs/popular:
 *   get:
 *     summary: Get popular search queries
 *     tags: [SearchLog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to look back
 *     responses:
 *       200:
 *         description: List of popular queries with counts
 *       401:
 *         description: Admin authentication required
 */

/**
 * @swagger
 * /api/search-logs/training-data:
 *   get:
 *     summary: Get training data for ML model
 *     tags: [SearchLog]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Training data with query-manga pairs and relevance scores
 *       401:
 *         description: Admin authentication required
 */

/**
 * @swagger
 * /api/search-logs/training-data/csv:
 *   get:
 *     summary: Export training data as CSV
 *     tags: [SearchLog]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Admin authentication required
 */
