const { uploader } = require('../config/cloudinary');
const MangaService = require('../services/MangaService');

class MangaController {
    async createManga(req, res, next) {
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

            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async updateManga(req, res, next) {
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

            const result = await MangaService.updateManga(mangaId, updateData, coverImageBuffer);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getMangaList(req, res, next) {
        try {
            const result = await MangaService.getMangaList(req.query);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async searchManga(req, res, next) {
        try {
            const result = await MangaService.searchManga(req.query);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getMangaById(req, res, next) {
        try {
            const result = await MangaService.getMangaById(req.params.id);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getMangaByGenre(req, res, next) {
        try {
            const { genreId } = req.params;
            const filter = { ...req.query, genre: genreId };
            const result = await MangaService.getMangaList(filter);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async deleteManga(req, res, next) {
        try {
            const result = await MangaService.deleteManga(req.params.id);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getChapterList(req, res, next) {
        try {
            const result = await MangaService.getChapterList(req.params.mangaId);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getMangaCountByGenre(req, res, next) {
        try {
            const result = await MangaService.getMangaCountByGenre(req.params.genreId);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MangaController();