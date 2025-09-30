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
