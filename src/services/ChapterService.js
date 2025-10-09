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

    async updateChapter(chapterId, chapterData, files, userId) {
        try {
            // Find existing chapter
            const chapter = await Chapter.findById(chapterId).populate('mangaId');
            if (!chapter) {
                return {
                    status: 'error',
                    message: 'Chapter not found'
                };
            }

            // Check if user is authorized to update this chapter
            if (chapter.mangaId.uploaderId.toString() !== userId.toString()) {
                return {
                    status: 'error',
                    message: 'Not authorized to update this chapter'
                };
            }

            const { title, chapterNumber } = chapterData;
            const updateData = {};

            // Update title if provided
            if (title && title.trim() !== '') {
                updateData.title = title.trim();
            }

            // Update chapter number if provided and different
            if (chapterNumber && chapterNumber !== chapter.chapterNumber) {
                // Check if new chapter number conflicts with existing chapters
                const existingChapter = await Chapter.findOne({
                    mangaId: chapter.mangaId._id,
                    chapterNumber: chapterNumber,
                    _id: { $ne: chapterId }
                });

                if (existingChapter) {
                    return {
                        status: 'error',
                        message: 'Chapter with this number already exists'
                    };
                }

                updateData.chapterNumber = chapterNumber;
            }

            // Update pages if new files are provided
            if (files && files.length > 0) {
                // Delete old images from Cloudinary
                for (const page of chapter.pages) {
                    try {
                        const publicId = this.extractPublicIdFromUrl(page.image);
                        if (publicId) {
                            await CloudinaryUtils.deleteImage(publicId);
                        }
                    } catch (deleteError) {
                        console.warn('Failed to delete old image:', deleteError.message);
                    }
                }

                // Sort new files by page number
                const sortedFiles = files.sort((a, b) => {
                    const pageA = this.extractPageNumber(a.originalname);
                    const pageB = this.extractPageNumber(b.originalname);
                    return pageA - pageB;
                });

                // Upload new images to Cloudinary
                const uploadPromises = sortedFiles.map(async (file, index) => {
                    const pageNumber = index + 1;
                    const fileName = `${chapter.mangaId._id}_chapter_${updateData.chapterNumber || chapter.chapterNumber}_page_${pageNumber.toString().padStart(2, '0')}`;
                    
                    const uploadResult = await CloudinaryUtils.uploadImage(
                        file.buffer,
                        `manga/chapters/${chapter.mangaId._id}`,
                        fileName
                    );

                    return {
                        pageNumber,
                        image: uploadResult.secure_url
                    };
                });

                updateData.pages = await Promise.all(uploadPromises);
            }

            // Update updatedAt timestamp
            updateData.updatedAt = new Date();

            // Update chapter in database
            const updatedChapter = await Chapter.findByIdAndUpdate(
                chapterId,
                updateData,
                { new: true, runValidators: true }
            ).populate('mangaId', 'title');

            return {
                status: 'success',
                message: 'Chapter updated successfully',
                data: updatedChapter
            };

        } catch (error) {
            return {
                status: 'error',
                message: 'Failed to update chapter: ' + error.message
            };
        }
    }

    // Helper method to extract page number from filename
    extractPageNumber(filename) {
        const match = filename.match(/page_(\d+)/i);
        return match ? parseInt(match[1]) : 0;
    }

    // Helper method to extract public ID from Cloudinary URL
    extractPublicIdFromUrl(url) {
        try {
            const matches = url.match(/\/([^/]+)\.[^.]+$/);
            return matches ? matches[1] : null;
        } catch (error) {
            return null;
        }
    }
}

module.exports = new ChapterService();