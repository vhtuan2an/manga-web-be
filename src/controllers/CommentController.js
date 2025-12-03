
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