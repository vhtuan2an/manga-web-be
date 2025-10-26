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

            // Validate file sizes (limit to 10MB per file)
            const maxFileSize = 10 * 1024 * 1024; // 10MB
            for (const file of files) {
                if (file.size > maxFileSize) {
                    return {
                        status: 'error',
                        message: `File ${file.originalname} is too large. Maximum size is 10MB.`
                    };
                }
            }

            // Sort files by page number extracted from filename
            const sortedFiles = files.sort((a, b) => {
                const pageA = this.extractPageNumber(a.originalname);
                const pageB = this.extractPageNumber(b.originalname);
                return pageA - pageB;
            });

            console.log(`Starting upload of ${sortedFiles.length} images...`);

            // Upload images to Cloudinary with batch processing (15 at a time)
            const batchSize = 15;
            const pages = [];
            
            for (let i = 0; i < sortedFiles.length; i += batchSize) {
                const batch = sortedFiles.slice(i, i + batchSize);
                console.log(`Uploading batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(sortedFiles.length/batchSize)}`);
                
                const batchPromises = batch.map(async (file, batchIndex) => {
                    const actualIndex = i + batchIndex;
                    const pageNumber = actualIndex + 1;
                    const fileName = `${mangaId}_chapter_${chapterNumber}_page_${pageNumber.toString().padStart(2, '0')}`;
                    
                    try {
                        const uploadResult = await this.uploadWithRetry(
                            file.buffer,
                            `manga/chapters/${mangaId}`,
                            fileName,
                            3 // max retries
                        );

                        return {
                            pageNumber,
                            image: uploadResult.secure_url
                        };
                    } catch (uploadError) {
                        console.error(`Failed to upload page ${pageNumber}:`, uploadError.message);
                        throw new Error(`Failed to upload page ${pageNumber}: ${uploadError.message}`);
                    }
                });

                try {
                    const batchResults = await Promise.all(batchPromises);
                    pages.push(...batchResults);
                } catch (batchError) {
                    console.error('Batch upload failed:', batchError);
                    throw new Error(`Batch upload failed: ${batchError.message}`);
                }
            }

            console.log(`Successfully uploaded ${pages.length} images`);

            // Sort pages by page number
            pages.sort((a, b) => a.pageNumber - b.pageNumber);

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
            console.error('Chapter upload error:', error);
            return {
                status: 'error',
                message: 'Failed to upload chapter: ' + error.message
            };
        }
    }

    // Helper method to upload with retry logic
    async uploadWithRetry(buffer, folder, fileName, maxRetries = 3, delay = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Upload attempt ${attempt}/${maxRetries} for ${fileName}`);
                const result = await CloudinaryUtils.uploadImage(buffer, folder, fileName);
                console.log(`Successfully uploaded ${fileName}`);
                return result;
            } catch (error) {
                console.error(`Upload attempt ${attempt} failed for ${fileName}:`, error.message);
                
                if (attempt === maxRetries) {
                    throw error;
                }
                
                // Wait before retry (exponential backoff)
                const waitTime = delay * Math.pow(2, attempt - 1);
                console.log(`Waiting ${waitTime}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    async getChapterById(chapterId) {
        try {
            const chapter = await Chapter.findById(chapterId)
                .lean();
            if (!chapter) {
                return {
                    status: 'error',
                    message: 'Chapter not found'
                };
            }
            return {
                status: 'success',
                data: chapter
            };
        } catch (error) {
            console.error('Error fetching chapter:', error);
            return {
                status: 'error',
                message: 'Failed to fetch chapter: ' + error.message
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
                // Validate file sizes
                const maxFileSize = 10 * 1024 * 1024; // 10MB
                for (const file of files) {
                    if (file.size > maxFileSize) {
                        return {
                            status: 'error',
                            message: `File ${file.originalname} is too large. Maximum size is 10MB.`
                        };
                    }
                }

                console.log(`Updating chapter with ${files.length} new images...`);

                // Delete old images from Cloudinary (in background)
                this.deleteOldImages(chapter.pages);

                // Sort new files by page number
                const sortedFiles = files.sort((a, b) => {
                    const pageA = this.extractPageNumber(a.originalname);
                    const pageB = this.extractPageNumber(b.originalname);
                    return pageA - pageB;
                });

                // Upload new images with batch processing
                const batchSize = 15;
                const pages = [];
                
                for (let i = 0; i < sortedFiles.length; i += batchSize) {
                    const batch = sortedFiles.slice(i, i + batchSize);
                    console.log(`Uploading batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(sortedFiles.length/batchSize)}`);
                    
                    const batchPromises = batch.map(async (file, batchIndex) => {
                        const actualIndex = i + batchIndex;
                        const pageNumber = actualIndex + 1;
                        const fileName = `${chapter.mangaId._id}_chapter_${updateData.chapterNumber || chapter.chapterNumber}_page_${pageNumber.toString().padStart(2, '0')}`;
                        
                        const uploadResult = await this.uploadWithRetry(
                            file.buffer,
                            `manga/chapters/${chapter.mangaId._id}`,
                            fileName,
                            3
                        );

                        return {
                            pageNumber,
                            image: uploadResult.secure_url
                        };
                    });

                    const batchResults = await Promise.all(batchPromises);
                    pages.push(...batchResults);
                }

                // Sort pages by page number
                pages.sort((a, b) => a.pageNumber - b.pageNumber);
                updateData.pages = pages;
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
            console.error('Chapter update error:', error);
            return {
                status: 'error',
                message: 'Failed to update chapter: ' + error.message
            };
        }
    }

    // Helper method to delete old images in background
    async deleteOldImages(pages) {
        // Run deletion in background without blocking the main process
        setTimeout(async () => {
            for (const page of pages) {
                try {
                    const publicId = this.extractPublicIdFromUrl(page.image);
                    if (publicId) {
                        await CloudinaryUtils.deleteImage(publicId);
                        console.log(`Deleted old image: ${publicId}`);
                    }
                } catch (deleteError) {
                    console.warn('Failed to delete old image:', deleteError.message);
                }
            }
        }, 100);
    }

    // Helper method to extract page number from filename
    extractPageNumber(filename) {
        const match = filename.match(/page_(\d+)/i) || filename.match(/(\d+)/);
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