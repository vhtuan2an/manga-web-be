const Manga = require('../models/Manga');

class MangaService {
    async createManga(mangaData) {
        try {
            const manga = new Manga(mangaData);
            await manga.save();
            return {
                status: 'success',
                message: 'Manga created successfully',
                data: manga
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Failed to create manga: ' + error.message
            };
        }
    }
}

module.exports = new MangaService();