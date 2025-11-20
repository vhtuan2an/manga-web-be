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
            if (!genre) return res.status(404).json({ status: 'error', message: 'Genre not found' });
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
            if (!genre) return res.status(404).json({ status: 'error', message: 'Genre not found' });
            res.json(genre);
        } catch (error) {
            res.status(400).json({ status: 'error', message: 'Bad request: ' + error.message });
        }
    }

    async deleteGenre(req, res) {
        try {
            const genre = await GenreService.deleteGenre(req.params.id);
            if (!genre) return res.status(404).json({ status: 'error', message: 'Genre not found' });
            res.json({ message: 'Genre deleted' });
        } catch (error) {
            res.status(500).json({ status: 'error', message: 'Internal server error: ' + error.message });
        }
    }
}

module.exports = new GenreController();

/**
 * @swagger
 * /api/genres:
 *   get:
 *     summary: Get all genres
 *     tags: [Genres]
 *     responses:
 *       200:
 *         description: List of all genres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Genre'
 */

/**
 * @swagger
 * /api/genres:
 *   post:
 *     summary: Create a new genre
 *     tags: [Genres]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Genre name
 *               description:
 *                 type: string
 *                 description: Genre description
 *     responses:
 *       201:
 *         description: Genre created successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /api/genres/{id}:
 *   get:
 *     summary: Get genre by ID
 *     tags: [Genres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Genre ID
 *     responses:
 *       200:
 *         description: Genre information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Genre'
 *       404:
 *         description: Genre not found
 */

/**
 * @swagger
 * /api/genres/{id}:
 *   put:
 *     summary: Update genre
 *     tags: [Genres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Genre ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Genre updated successfully
 *       404:
 *         description: Genre not found
 */

/**
 * @swagger
 * /api/genres/{id}:
 *   delete:
 *     summary: Delete genre
 *     tags: [Genres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Genre ID
 *     responses:
 *       200:
 *         description: Genre deleted successfully
 *       404:
 *         description: Genre not found
 */