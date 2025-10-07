const ChapterService = require('../services/ChapterService');

class ChapterController {
    async uploadChapter(req, res) {
        try {
            const { mangaId } = req.params;
            const chapterData = req.body;
            const files = req.files; // Multer sẽ cung cấp array các files

            console.log('Upload chapter request:', {
                mangaId,
                chapterData,
                filesCount: files ? files.length : 0
            });

            const result = await ChapterService.uploadChapter(mangaId, chapterData, files);

            if (result.status === 'error') {
                return res.status(422).json(result);
            }

            return res.status(201).json(result);

        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error: ' + error.message
            });
        }
    }
}

module.exports = new ChapterController();

/**
 * @swagger
 * /api/chapters/{mangaId}:
 *   post:
 *     summary: Upload a new chapter
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mangaId
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
 *             required:
 *               - chapterNumber
 *               - title
 *             properties:
 *               chapterNumber:
 *                 type: number
 *                 description: Chapter number
 *               title:
 *                 type: string
 *                 description: Chapter title
 *               pages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Chapter page images
 *     responses:
 *       201:
 *         description: Chapter uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Chapter'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */