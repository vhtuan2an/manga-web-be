const ChapterService = require('../services/ChapterService');

class ChapterController {
    async uploadChapter(req, res) {
        try {
            const { mangaId } = req.params;
            const chapterData = req.body;
            
            // req.files sẽ có dạng: { thumbnail: [file], pages: [file1, file2, ...] }
            const thumbnail = req.files?.thumbnail ? req.files.thumbnail[0] : null;
            const pages = req.files?.pages || [];

            console.log('Upload chapter request:', {
                mangaId,
                chapterData,
                hasThumbnail: !!thumbnail,
                pagesCount: pages.length
            });

            const result = await ChapterService.uploadChapter(mangaId, chapterData, pages, thumbnail);

            if (result.status === 'error') {
                return res.status(422).json(result);
            }

            return res.status(201).json(result);

        } catch (error) {
            console.error('Upload chapter error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error: ' + error.message
            });
        }
    }

    async getChapterById(req, res) {
        try {
            const { chapterId } = req.params;
            const result = await ChapterService.getChapterById(chapterId);

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

    async updateChapter(req, res) {
        try {
            const { chapterId } = req.params;
            const chapterData = req.body;
            const thumbnail = req.files?.thumbnail ? req.files.thumbnail[0] : null;
            const pages = req.files?.pages || [];
            const userId = req.id;

            console.log('Update chapter request:', {
                chapterId,
                chapterData,
                hasThumbnail: !!thumbnail,
                pagesCount: pages.length,
                userId
            });

            const result = await ChapterService.updateChapter(chapterId, chapterData, pages, userId, thumbnail);

            if (result.status === 'error') {
                const statusCode = result.message.includes('not found') ? 404 : 
                                 result.message.includes('not authorized') ? 403 : 422;
                return res.status(statusCode).json(result);
            }

            return res.status(200).json(result);

        } catch (error) {
            console.error('Update chapter error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error: ' + error.message
            });
        }
    }

    async deleteChapter(req, res) {
        try {
            const { chapterId } = req.params;
            const userId = req.id;
            const result = await ChapterService.deleteChapter(chapterId, userId);

            if (result.status === 'error') {
                const statusCode = result.message.includes('not found') ? 404 : 
                                 result.message.includes('not authorized') ? 403 : 422;
                return res.status(statusCode).json(result);
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

module.exports = new ChapterController();