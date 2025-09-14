const MangaController = require('../controllers/MangaController');
const express = require('express');
const { authMiddleware } = require('../middlewares/AuthMiddleware');
const { uploadSingle } = require('../middlewares/UploadMiddlewares');
const router = express.Router();

router.post('/', authMiddleware(['uploader']), uploadSingle, MangaController.createManga);
router.put('/:id/cover', authMiddleware(['uploader']), uploadSingle, MangaController.updateMangaCover);

module.exports = router;