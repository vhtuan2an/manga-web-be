const { uploader } = require('../config/cloudinary');
const MangaService = require('../services/MangaService');

class MangaController {
    async createManga(req, res) {
        try {
            // Log để debug
            console.log('req.body:', req.body);
            console.log('req.file:', req.file);

            let mangaData = {
                uploaderId: req.id,
                ...req.body
            };

            // Xử lý genres từ form-data
            if (req.body.genres) {
                if (typeof req.body.genres === 'string') {
                    try {
                        // Nếu là JSON string
                        mangaData.genres = JSON.parse(req.body.genres);
                    } catch {
                        // Nếu là string với dấu phẩy
                        mangaData.genres = req.body.genres.split(',').map(id => id.trim());
                    }
                }
                // Nếu đã là array thì giữ nguyên
            }

            // Gán uploaderId từ token
            mangaData.uploaderId = req.id;

            const coverImage = req.file;
            let coverImageBuffer = null;
            if (coverImage) {
                coverImageBuffer = coverImage.buffer;
            }

            const result = await MangaService.createManga(mangaData, coverImageBuffer);
            if (result.status === 'error') {
                return res.status(422).json(result);
            }
            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error: ' + error.message
            });
        }
    }

    async updateManga(req, res) {
        try {
            const { id } = req.params;

            let updateData = { ...req.body };

            // Handle genres processing
            if (req.body.genres) {
                if (typeof req.body.genres === 'string') {
                    try {
                        // If it's a JSON string
                        updateData.genres = JSON.parse(req.body.genres);
                    } catch {
                        // If it's a comma-separated string
                        updateData.genres = req.body.genres.split(',').map(id => id.trim());
                    }
                }
            }

            // Xử lý cover image (nếu có)
            const coverImage = req.file;
            let coverImageBuffer = null;
            if (coverImage) {
                coverImageBuffer = coverImage.buffer;
            }

            const result = await MangaService.updateManga(id, updateData, coverImageBuffer);
            if (result.status === 'error') {
                return res.status(422).json(result);
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error: ' + error.message
            });
        }
    }

    async getMangaList(req, res) {
        try {
            const filter = req.query;
            const result = await MangaService.getMangaList(filter);
            if (result.status === 'error') {
                return res.status(422).json(result);
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error: ' + error.message
            });
        }
    }

    async getMangaById(req, res) {
        try {
            const { id } = req.params;
            const result = await MangaService.getMangaById(id);
            if (result.status === 'error') {
                return res.status(404).json(result);
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error: ' + error.message
            });
        }
    }

    async getMangaByGenre(req, res) {
        try {
            const { genreId } = req.params;
            const filter = { ...req.query, genre: genreId };
            const result = await MangaService.getMangaList(filter);
            if (result.status === 'error') {
                return res.status(422).json(result);
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error: ' + error.message
            });
        }
    }

    async deleteManga(req, res) {
        try {
            const { id } = req.params;
            const result = await MangaService.deleteManga(id);
            if (result.status === 'error') {
                return res.status(404).json(result);
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error: ' + error.message
            });
        }
    }

    async getChapterList(req, res) {
        try {
            const { mangaId } = req.params;
            const result = await MangaService.getChapterList(mangaId);
            if (result.status === 'error') {
                return res.status(422).json(result);
            }
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error: ' + error.message
            });
        }
    }

    async getMangaCountByGenre(req, res) {
        try {
            const { genreId } = req.params;
            const result = await MangaService.getMangaCountByGenre(genreId);
            
            if (result.status === 'error') {
                return res.status(404).json(result);
            }
            
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error: ' + error.message
            });
        }
    }
}

module.exports = new MangaController();

/**
 * @swagger
 * /api/mangas:
 *   post:
 *     summary: Create a new manga
 *     tags: [Manga]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *                 description: Manga title
 *               description:
 *                 type: string
 *                 description: Manga description
 *               author:
 *                 type: string
 *                 description: Manga author
 *               genres:
 *                 type: string
 *                 description: Genre IDs (JSON array or comma-separated)
 *               status:
 *                 type: string
 *                 enum: [ongoing, completed, hiatus]
 *               coverImage:
 *                 type: string
 *                 format: binary
 *                 description: Cover image file
 *     responses:
 *       201:
 *         description: Manga created successfully
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/mangas:
 *   get:
 *     summary: Get list of mangas
 *     tags: [Manga]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ongoing, completed, hiatus]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of mangas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Manga'
 *                 pagination:
 *                   type: object
 */

/**
 * @swagger
 * /api/mangas/{id}:
 *   get:
 *     summary: Get manga by ID
 *     tags: [Manga]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga ID
 *     responses:
 *       200:
 *         description: Manga information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Manga'
 *       404:
 *         description: Manga not found
 */

/**
 * @swagger
 * /api/mangas/{id}:
 *   put:
 *     summary: Update manga
 *     tags: [Manga]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               author:
 *                 type: string
 *               genres:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ongoing, completed, hiatus]
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Manga updated successfully
 *       404:
 *         description: Manga not found
 */

/**
 * @swagger
 * /api/mangas/{id}:
 *   delete:
 *     summary: Delete manga
 *     tags: [Manga]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga ID
 *     responses:
 *       200:
 *         description: Manga deleted successfully
 *       404:
 *         description: Manga not found
 */

/**
 * @swagger
 * /api/mangas/genre/{genreId}:
 *   get:
 *     summary: Get mangas by genre
 *     tags: [Manga]
 *     parameters:
 *       - in: path
 *         name: genreId
 *         required: true
 *         schema:
 *           type: string
 *         description: Genre ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of mangas by genre
 */

/**
 * @swagger
 * /api/mangas/{mangaId}/chapters:
 *   get:
 *     summary: Get chapters for a manga
 *     tags: [Manga]
 *     parameters:
 *       - in: path
 *         name: mangaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga ID
 *     responses:
 *       200:
 *         description: List of chapters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chapter'
 */