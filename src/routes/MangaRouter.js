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

module.exports = router;