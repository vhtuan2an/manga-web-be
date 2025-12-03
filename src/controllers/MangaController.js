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