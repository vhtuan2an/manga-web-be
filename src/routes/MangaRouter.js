const MangaController = require('../controllers/MangaController');
const express = require('express');
const { authMiddleware } = require('../middlewares/AuthMiddleware');
const { uploadSingle } = require('../middlewares/UploadMiddlewares');
const { checkMangaOwnership } = require('../middlewares/CheckMangaOwnership');
const router = express.Router();

router.post('/', authMiddleware(['uploader']), uploadSingle, MangaController.createManga);
router.get('/', MangaController.getMangaList);
router.get('/:id', MangaController.getMangaById);
router.put('/:id', authMiddleware(['uploader']), uploadSingle, checkMangaOwnership, MangaController.updateManga);
router.delete('/:id', authMiddleware(['admin', 'uploader']), checkMangaOwnership, MangaController.deleteManga);
router.get('/:mangaId/chapters', MangaController.getChapterList);

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