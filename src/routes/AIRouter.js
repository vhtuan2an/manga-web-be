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
 *         description: AI-generated manga recommendations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Shadow Blade Chronicles"
 *                       description:
 *                         type: string
 *                         example: "A thrilling tale of a young ninja discovering mystical powers while navigating forbidden love"
 *                       genres:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["Action", "Romance", "Supernatural"]
 *                       suggestedAuthor:
 *                         type: string
 *                         example: "Masashi Kishimoto"
 *                       estimatedChapters:
 *                         type: integer
 *                         example: 200
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