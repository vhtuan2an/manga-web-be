const ChapterController = require("../controllers/ChapterController");
const express = require("express");
const { authMiddleware } = require("../middlewares/AuthMiddleware");
const { uploadChapterFiles } = require("../middlewares/UploadMiddlewares");
const { checkMangaOwnership } = require("../middlewares/CheckMangaOwnership");
const router = express.Router();

router.post(
  "/:mangaId",
  authMiddleware(["uploader"]),
  checkMangaOwnership,
  uploadChapterFiles,
  ChapterController.uploadChapter
);
router.put(
  "/:chapterId",
  authMiddleware(["uploader"]),
  uploadChapterFiles,
  ChapterController.updateChapter
);
router.get("/:chapterId", ChapterController.getChapterById);
router.delete(
  "/:chapterId",
  authMiddleware(["admin", "uploader"]),
  ChapterController.deleteChapter
);
router.get(
  "/count/uploader",
  authMiddleware(["uploader"]),
  ChapterController.getChapterCountByUploader
);

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
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Chapter thumbnail image (optional)
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

/**
 * @swagger
 * /api/chapters/{chapterId}:
 *   put:
 *     summary: Update an existing chapter
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chapter ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               chapterNumber:
 *                 type: number
 *                 description: Updated chapter number
 *                 example: 2
 *               title:
 *                 type: string
 *                 description: Updated chapter title
 *                 example: "The Beginning - Revised"
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Updated chapter thumbnail (optional)
 *               pages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Updated chapter page images (optional - if not provided, existing pages will be kept)
 *     responses:
 *       200:
 *         description: Chapter updated successfully
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
 *         description: Not authorized to update this chapter
 *       404:
 *         description: Chapter not found
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/chapters/{chapterId}:
 *   get:
 *     summary: Get chapter by ID
 *     tags: [Chapters]
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chapter ID
 *     responses:
 *       200:
 *         description: Chapter retrieved successfully
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
 *       404:
 *         description: Chapter not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/chapters/count/uploader:
 *   get:
 *     summary: Get chapter count for the current uploader
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chapter count retrieved successfully
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
 *                     uploaderId:
 *                       type: string
 *                       description: ID of the uploader
 *                     totalChapters:
 *                       type: integer
 *                       description: Total number of chapters uploaded
 *                       example: 150
 *                     totalMangas:
 *                       type: integer
 *                       description: Total number of mangas created by uploader
 *                       example: 10
 *       401:
 *         description: Authentication required (uploader role)
 *       500:
 *         description: Internal server error
 */
