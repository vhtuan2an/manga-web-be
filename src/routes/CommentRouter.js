const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/CommentController');
const { authMiddleware } = require('../middlewares/AuthMiddleware');

// Create a comment
router.post('/', authMiddleware(['reader', 'uploader', 'admin']), CommentController.createComment);

// Get comments for a manga
router.get('/manga/:mangaId', CommentController.getCommentsByManga);

// Get comments for a chapter
router.get('/chapter/:chapterId', CommentController.getCommentsByChapter);

// Update a comment
router.put('/:id', authMiddleware(['reader', 'uploader', 'admin']), CommentController.updateComment);

// Delete a comment
router.delete('/:id', authMiddleware(['reader', 'uploader', 'admin']), CommentController.deleteComment);

module.exports = router;
