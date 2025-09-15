const ChapterController = require('../controllers/ChapterController');
const express = require('express');
const { authMiddleware } = require('../middlewares/AuthMiddleware');
const { uploadMultiple } = require('../middlewares/UploadMiddlewares');
const { checkMangaOwnership } = require('../middlewares/CheckMangaOwnership');
const router = express.Router();

router.post('/:mangaId', authMiddleware(["uploader"]), checkMangaOwnership, uploadMultiple, ChapterController.uploadChapter);

module.exports = router;