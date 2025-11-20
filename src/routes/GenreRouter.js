const GenreController = require('../controllers/GenreController');
const express = require('express');
const router = express.Router();

router.get('/', GenreController.getAllGenres);
router.get('/:id', GenreController.getGenreById);
router.post('/', GenreController.createGenre);
router.put('/:id', GenreController.updateGenre);
router.delete('/:id', GenreController.deleteGenre);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Genres
 *   description: Genre management and categorization endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GenreWithCount:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 64f8a1b2c3d4e5f6a7b8c9d0
 *         name:
 *           type: string
 *           example: Action
 *         description:
 *           type: string
 *           example: Fast-paced stories with fighting and adventure
 *         mangaCount:
 *           type: integer
 *           example: 42
 *           description: Number of mangas in this genre
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/genres:
 *   get:
 *     summary: Get all genres with manga count
 *     tags: [Genres]
 *     responses:
 *       200:
 *         description: List of all genres with their manga counts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GenreWithCount'
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
 *                 example: Action
 *               description:
 *                 type: string
 *                 description: Genre description
 *                 example: Fast-paced stories with fighting and adventure
 *     responses:
 *       201:
 *         description: Genre created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenreWithCount'
 *       400:
 *         description: Bad request - validation error
 */

/**
 * @swagger
 * /api/genres/{id}:
 *   get:
 *     summary: Get genre by ID with manga count
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
 *         description: Genre information with manga count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenreWithCount'
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
 *                 example: Updated Genre Name
 *               description:
 *                 type: string
 *                 example: Updated genre description
 *     responses:
 *       200:
 *         description: Genre updated successfully with manga count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenreWithCount'
 *       404:
 *         description: Genre not found
 *       400:
 *         description: Bad request
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Genre deleted
 *       404:
 *         description: Genre not found
 */