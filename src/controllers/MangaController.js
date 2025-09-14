const MangaService = require('../services/MangaService');

class MangaController {
    async createManga(req, res) {
        try {
            const mangaData = req.body;
            const coverImage = req.file; // từ multer middleware

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
}

module.exports = new MangaController();
