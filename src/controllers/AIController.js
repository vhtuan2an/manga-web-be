const AIService = require('../services/AIService');

class AIController {
    // Generate manga based on user description
    async generateMangaByDescription(req, res) {
        try {
            const { description } = req.body;
            if (!description) {
                return res.status(400).json({ message: 'Description is required' });
            }
            const result = await AIService.generateMangaByDescription(description);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: 'Failed to generate manga: ' + error.message });
        }
    }
}

module.exports = new AIController();

/**
 * @swagger
 * /api/ai/generate-manga:
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
 *                 description: Description of desired manga content/style
 *                 example: "I want a manga about ninjas with supernatural powers"
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
 *                       description:
 *                         type: string
 *                       genres:
 *                         type: array
 *                         items:
 *                           type: string
 *       400:
 *         description: Missing description
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
 *                   example: Failed to generate manga
 */