const ChapterController = require('../controllers/ChapterController');
const express = require('express');
const { authMiddleware } = require('../middlewares/AuthMiddleware');
const { uploadMultiple } = require('../middlewares/UploadMiddlewares');
const { checkMangaOwnership } = require('../middlewares/CheckMangaOwnership');
const router = express.Router();

router.post('/:mangaId', authMiddleware(["uploader"]), checkMangaOwnership, uploadMultiple, ChapterController.uploadChapter);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Chapters
 *   description: Chapter management and upload endpoints
 */

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
 *         description: Manga ID to upload chapter to
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - chapterNumber
 *               - title
 *               - pages
 *             properties:
 *               chapterNumber:
 *                 type: number
 *                 description: Chapter number (e.g., 1, 2, 3)
 *                 example: 1
 *               title:
 *                 type: string
 *                 description: Chapter title
 *                 example: "The Beginning"
 *               pages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Chapter page images (multiple files)
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
 *       401:
 *         description: Authentication required (uploader role)
 *       403:
 *         description: Not authorized to upload to this manga
 *       404:
 *         description: Manga not found
 *       422:
 *         description: Validation error (missing data or files)
 *       500:
 *         description: Internal server error
 */