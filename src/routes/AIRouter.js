const AIController = require('../controllers/AIController');
const express = require('express');
const router = express.Router();

// Route to get manga based on user description
router.post('/get-manga', AIController.generateMangaByDescription);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI-powered features and recommendations
 */

/**
 * @swagger
 * /api/ai/get-manga:
 *   post:
 *     summary: Generate manga recommendations based on description
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *                 description: Description of desired manga content, style, or themes
 *                 example: "I want a manga about ninjas with supernatural powers and romance"
 *                 minLength: 10
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: AI-generated manga recommendations based on user description
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggestedGenres:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of genre names that match the user's description
 *                   example: ["Action", "Romance", "Supernatural"]
 *                 recommendedMangas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Manga ID
 *                         example: "64f8a1b2c3d4e5f6a7b8c9d0"
 *                       name:
 *                         type: string
 *                         description: Manga title
 *                         example: "Naruto"
 *                       reason:
 *                         type: string
 *                         description: Brief explanation why this manga is recommended (1-2 sentences)
 *                         example: "Phù hợp với thể loại hành động và có yếu tố siêu nhiên mà bạn quan tâm"
 *                   description: List of recommended manga from database sorted by relevance
 *       400:
 *         description: Missing or invalid description
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Description is required
 *       500:
 *         description: AI service error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to generate manga recommendations
 */