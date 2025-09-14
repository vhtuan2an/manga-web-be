const MangaService = require('../services/MangaService');

class MangaController {
    async createManga(req, res) {
        try {
            // Log để debug
            console.log('req.body:', req.body);
            console.log('req.file:', req.file);

            let mangaData = { ...req.body };
            
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

    async updateMangaCover(req, res) {
        try {
            const { id } = req.params;
            const coverImage = req.file;

            if (!coverImage) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cover image is required'
                });
            }

            const result = await MangaService.updateMangaCover(id, coverImage.buffer);
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
}

module.exports = new MangaController();
