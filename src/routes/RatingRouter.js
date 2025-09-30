
const express = require('express');
const router = express.Router();
const RatingController = require('../controllers/RatingController');
const { authMiddleware } = require('../middlewares/AuthMiddleware');

router.post('/', authMiddleware(['reader', 'uploader', 'admin']), RatingController.rateManga);
router.get('/manga/:mangaId', RatingController.getMangaAverageRating);
router.get('/manga/:mangaId/user', authMiddleware(['reader', 'uploader', 'admin']), RatingController.getUserRatingForManga);

module.exports = router;
