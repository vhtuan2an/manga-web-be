const GenreController = require('../controllers/GenreController');
const express = require('express');
const router = express.Router();

router.get('/', GenreController.getAllGenres);
router.get('/:id', GenreController.getGenreById);
router.post('/', GenreController.createGenre);
router.put('/:id', GenreController.updateGenre);
router.delete('/:id', GenreController.deleteGenre);

module.exports = router;
