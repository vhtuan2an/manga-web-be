const ChapterService = require('../services/ChapterService');
const ApiError = require('../utils/ApiErrorUtils');

class ChapterController {
    async uploadChapter(req, res, next) {
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

            res.status(201).json(result);
        } catch (error) {
            console.error('Upload chapter error:', error);
            next(error);
        }
    }

    async getChapterById(req, res, next) {
        try {
            const { chapterId } = req.params;
            const result = await ChapterService.getChapterById(chapterId);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async updateChapter(req, res, next) {
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

            res.status(200).json(result);
        } catch (error) {
            console.error('Update chapter error:', error);
            next(error);
        }
    }

    async deleteChapter(req, res, next) {
        try {
            const { chapterId } = req.params;
            const userId = req.id;
            const result = await ChapterService.deleteChapter(chapterId, userId);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getChapterCountByUploader(req, res, next) {
        try {
            const uploaderId = req.id; // Lấy từ authMiddleware
            const result = await ChapterService.getChapterCountByUploader(uploaderId);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ChapterController();