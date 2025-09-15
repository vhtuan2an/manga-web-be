const ChapterService = require('../services/ChapterService');

class ChapterController {
    async uploadChapter(req, res) {
        try {
            const { mangaId } = req.params;
            const chapterData = req.body;
            const files = req.files; // Multer sẽ cung cấp array các files

            console.log('Upload chapter request:', {
                mangaId,
                chapterData,
                filesCount: files ? files.length : 0
            });

            const result = await ChapterService.uploadChapter(mangaId, chapterData, files);

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
}

module.exports = new ChapterController();