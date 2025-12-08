const GenreService = require('../services/GenreService');

class GenreController {
    async getAllGenres(req, res) {
        try {
            const genres = await GenreService.getAllGenres();
            res.json(genres);
        } catch (error) {
            res.status(500).json({ status: 'error', message: 'Internal server error: ' + error.message });
        }
    }

    async getGenreById(req, res) {
        try {
            const genre = await GenreService.getGenreById(req.params.id);
            if (!genre.data) return res.status(404).json({ status: 'error', message: 'Genre not found' });
            res.json(genre);
        } catch (error) {
            res.status(500).json({ status: 'error', message: 'Internal server error: ' + error.message });
        }
    }

    async createGenre(req, res) {
        try {
            const genre = await GenreService.createGenre(req.body);
            res.status(201).json(genre);
        } catch (error) {
            res.status(400).json({ status: 'error', message: 'Bad request: ' + error.message });
        }
    }

    async updateGenre(req, res) {
        try {
            const genre = await GenreService.updateGenre(req.params.id, req.body);
            if (!genre.data) return res.status(404).json({ status: 'error', message: 'Genre not found' });
            res.json(genre);
        } catch (error) {
            res.status(400).json({ status: 'error', message: 'Bad request: ' + error.message });
        }
    }

    async deleteGenre(req, res) {
        try {
            const genre = await GenreService.deleteGenre(req.params.id);
            if (!genre.data) return res.status(404).json({ status: 'error', message: 'Genre not found' });
            res.json({ status: 'success', message: 'Genre deleted' });
        } catch (error) {
            res.status(500).json({ status: 'error', message: 'Internal server error: ' + error.message });
        }
    }

    async searchGenres(req, res) {
        try {
            const { query } = req.query;
            const genres = await GenreService.searchGenres(query);
            res.json(genres);
        } catch (error) {
            res.status(500).json({ 
                status: 'error', 
                message: 'Internal server error: ' + error.message 
            });
        }
    }
}

module.exports = new GenreController();