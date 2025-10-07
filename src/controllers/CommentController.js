
const CommentService = require('../services/CommentService');

class CommentController {
	// POST /api/comments
	async createComment(req, res) {
		try {
			// req.id is set by authMiddleware
			const userId = req.id;
			const { manga, chapter, content } = req.body;
			if (!userId) {
				return res.status(401).json({ status: 'error', message: 'Authentication required' });
			}
			const result = await CommentService.createComment({ userId, manga, chapter, content });
			if (result.status === 'error') {
				return res.status(400).json(result);
			}
			return res.status(201).json(result);
		} catch (error) {
			return res.status(500).json({ status: 'error', message: error.message });
		}
	}

	// GET /api/comments/manga/:mangaId
	async getCommentsByManga(req, res) {
		try {
			const comments = await CommentService.getCommentsByManga(req.params.mangaId);
			return res.json({ status: 'success', data: comments });
		} catch (error) {
			return res.status(500).json({ status: 'error', message: error.message });
		}
	}

	// GET /api/comments/chapter/:chapterId
	async getCommentsByChapter(req, res) {
		try {
			const comments = await CommentService.getCommentsByChapter(req.params.chapterId);
			return res.json({ status: 'success', data: comments });
		} catch (error) {
			return res.status(500).json({ status: 'error', message: error.message });
		}
	}

	// PUT /api/comments/:id
	async updateComment(req, res) {
		try {
			const userId = req.id;
			const { content } = req.body;
			if (!userId) {
				return res.status(401).json({ status: 'error', message: 'Authentication required' });
			}
			const comment = await CommentService.updateComment(req.params.id, userId, content);
			if (!comment) {
				return res.status(403).json({ status: 'error', message: 'Not allowed or not found' });
			}
			return res.json({ status: 'success', data: comment });
		} catch (error) {
			return res.status(500).json({ status: 'error', message: error.message });
		}
	}

	// DELETE /api/comments/:id
	async deleteComment(req, res) {
		try {
			const userId = req.id;
			if (!userId) {
				return res.status(401).json({ status: 'error', message: 'Authentication required' });
			}
			const comment = await CommentService.deleteComment(req.params.id, userId);
			if (!comment) {
				return res.status(403).json({ status: 'error', message: 'Not allowed or not found' });
			}
			return res.json({ status: 'success', message: 'Comment deleted' });
		} catch (error) {
			return res.status(500).json({ status: 'error', message: error.message });
		}
	}
}

module.exports = new CommentController();

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
 *     responses:
 *       201:
 *         description: Comment created successfully
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
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not allowed or comment not found
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
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not allowed or comment not found
 */