const Chapter = require('../models/Chapter');
const Manga = require('../models/Manga');
const CloudinaryUtils = require('../utils/CloudinaryUtils');

class ChapterService {
    async uploadChapter(mangaId, chapterData, files) {
        try {
            const { title, chapterNumber } = chapterData;

            // Validate required fields
            if (!title || !chapterNumber) {
                return {
                    status: 'error',
                    message: 'Title and chapter number are required'
                };
            }

            // Check if manga exists
            const manga = await Manga.findById(mangaId);
            if (!manga) {
                return {
                    status: 'error',
                    message: 'Manga not found'
                };
            }

            // Check if chapter number already exists for this manga
            const existingChapter = await Chapter.findOne({ 
                mangaId, 
                chapterNumber 
            });
            if (existingChapter) {
                return {
                    status: 'error',
                    message: 'Chapter with this number already exists'
                };
            }

            // Process and sort files by page number
            if (!files || files.length === 0) {
                return {
                    status: 'error',
                    message: 'At least one page image is required'
                };
            }

            // Sort files by page number extracted from filename
            const sortedFiles = files.sort((a, b) => {
                const pageA = this.extractPageNumber(a.originalname);
                const pageB = this.extractPageNumber(b.originalname);
                return pageA - pageB;
            });

            // Upload images to Cloudinary
            const uploadPromises = sortedFiles.map(async (file, index) => {
                const pageNumber = index + 1; // Use sequential numbering
                const fileName = `${mangaId}_chapter_${chapterNumber}_page_${pageNumber.toString().padStart(2, '0')}`;
                
                const uploadResult = await CloudinaryUtils.uploadImage(
                    file.buffer,
                    `manga/chapters/${mangaId}`,
                    fileName
                );

                return {
                    pageNumber,
                    image: uploadResult.secure_url
                };
            });

            const pages = await Promise.all(uploadPromises);

            // Create new chapter
            const chapter = new Chapter({
                mangaId,
                title,
                chapterNumber,
                pages
            });

            await chapter.save();

            // Populate manga info in response
            const populatedChapter = await Chapter.findById(chapter._id)
                .populate('mangaId', 'title');

            return {
                status: 'success',
                message: 'Chapter uploaded successfully',
                data: populatedChapter
            };

        } catch (error) {
            return {
                status: 'error',
                message: 'Failed to upload chapter: ' + error.message
            };
        }
    }

    // Helper method to extract page number from filename
    extractPageNumber(filename) {
        const match = filename.match(/page_(\d+)/i);
        return match ? parseInt(match[1]) : 0;
    }
}

module.exports = new ChapterService();