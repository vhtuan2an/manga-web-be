const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/CommentController');
const { authMiddleware } = require('../middlewares/AuthMiddleware');

router.post('/', authMiddleware(['reader', 'uploader', 'admin']), CommentController.createComment);
router.get('/manga/:mangaId', CommentController.getCommentsByManga);
router.get('/chapter/:chapterId', CommentController.getCommentsByChapter);
router.put('/:id', authMiddleware(['reader', 'uploader', 'admin']), CommentController.updateComment);
router.delete('/:id', authMiddleware(['reader', 'uploader', 'admin']), CommentController.deleteComment);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comment system for manga and chapters
 */

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               manga:
 *                 type: string
 *                 description: Manga ID (for manga comment)
 *               chapter:
 *                 type: string
 *                 description: Chapter ID (for chapter comment)
 *               content:
 *                 type: string
 *                 description: Comment text
 *                 example: This is an amazing manga!
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid comment data
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/comments/manga/{mangaId}:
 *   get:
 *     summary: Get comments for a manga
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: mangaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga ID
 *     responses:
 *       200:
 *         description: List of comments for the manga
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
 *                     $ref: '#/components/schemas/Comment'
 */

/**
 * @swagger
 * /api/comments/chapter/{chapterId}:
 *   get:
 *     summary: Get comments for a chapter
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: string
 *         description: Chapter ID
 *     responses:
 *       200:
 *         description: List of comments for the chapter
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
 *                     $ref: '#/components/schemas/Comment'
 */

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated comment text
 *                 example: This is my updated comment
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not allowed to update this comment
 */

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Comment deleted
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not allowed to delete this comment
 */