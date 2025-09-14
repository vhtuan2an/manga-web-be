const MangaController = require('../controllers/MangaController');
const express = require('express');
const { authMiddleware } = require('../middlewares/AuthMiddleware');
const router = express.Router();

router.post('/', authMiddleware(['uploader']), MangaController.createManga);

module.exports = router;