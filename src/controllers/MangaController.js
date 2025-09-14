const MangaService = require('../services/MangaService');

class MangaController {
    async createManga(req, res) {
        const mangaData = req.body;
        const result = await MangaService.createManga(mangaData);
        if (result.status === 'error') {
            return res.status(422).json(result);
        }
        return res.status(201).json(result);
    }
}

module.exports = new MangaController();
