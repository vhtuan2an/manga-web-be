const Chapter = require('../models/Chapter');
const Manga = require('../models/Manga');
const CloudinaryUtils = require('../utils/CloudinaryUtils');

class ChapterService {
    async uploadChapter(mangaId, chapterData, files, thumbnailFile = null) {
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

            // Check if chapter number already exists
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

            // Validate pages
            if (!files || files.length === 0) {
                return {
                    status: 'error',
                    message: 'At least one page image is required'
                };
            }

            // Upload thumbnail if provided
            let thumbnailUrl = '';
            if (thumbnailFile) {
                try {
                    const thumbnailResult = await CloudinaryUtils.uploadImage(
                        thumbnailFile.buffer,
                        `manga/chapters/${mangaId}/thumbnails`,
                        `${mangaId}_chapter_${chapterNumber}_thumbnail`
                    );
                    thumbnailUrl = thumbnailResult.secure_url;
                    console.log('Thumbnail uploaded:', thumbnailUrl);
                } catch (thumbnailError) {
                    console.error('Failed to upload thumbnail:', thumbnailError);
                }
            }

            // Sort and upload pages
            const sortedFiles = files.sort((a, b) => {
                const pageA = this.extractPageNumber(a.originalname);
                const pageB = this.extractPageNumber(b.originalname);
                return pageA - pageB;
            });

            console.log(`Starting upload of ${sortedFiles.length} images...`);

            const batchSize = 15;
            const pages = [];
            
            for (let i = 0; i < sortedFiles.length; i += batchSize) {
                const batch = sortedFiles.slice(i, i + batchSize);
                console.log(`Uploading batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(sortedFiles.length/batchSize)}`);
                
                const batchPromises = batch.map(async (file, batchIndex) => {
                    const actualIndex = i + batchIndex;
                    const pageNumber = actualIndex + 1;
                    const fileName = `${mangaId}_chapter_${chapterNumber}_page_${pageNumber.toString().padStart(2, '0')}`;
                    
                    const uploadResult = await this.uploadWithRetry(
                        file.buffer,
                        `manga/chapters/${mangaId}`,
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

            pages.sort((a, b) => a.pageNumber - b.pageNumber);

            // If no thumbnail, use first page
            if (!thumbnailUrl && pages.length > 0) {
                thumbnailUrl = pages[0].image;
            }

            // Create chapter
            const chapter = new Chapter({
                mangaId,
                title,
                chapterNumber,
                pages,
                thumbnail: thumbnailUrl
            });

            await chapter.save();

            // Update manga: increment chapterCount and calculate progress
            const updatedManga = await Manga.findByIdAndUpdate(
                mangaId,
                { 
                    $inc: { chapterCount: 1 },
                },
                { new: true }
            );

            // Calculate progress: (chapterCount / rawCount) * 100 with 2 decimal places
            let progress = 0;
            if (updatedManga.rawCount > 0) {
                progress = Math.round((updatedManga.chapterCount / updatedManga.rawCount) * 100 * 100) / 100;
                // Ensure progress doesn't exceed 100%
                progress = Math.min(progress, 100);
            }

            // Update progress
            await Manga.findByIdAndUpdate(mangaId, { progress });

            const populatedChapter = await Chapter.findById(chapter._id)
                .populate('mangaId', 'title');

            console.log(`Chapter uploaded successfully. Manga stats updated: chapterCount=${updatedManga.chapterCount}, progress=${progress}%`);

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
                .populate('mangaId', 'title')
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

    // FIXED: Thêm thumbnailFile parameter
    async updateChapter(chapterId, chapterData, files, userId, thumbnailFile = null) {
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

            // Update thumbnail if provided
            if (thumbnailFile) {
                try {
                    console.log('Updating thumbnail...');
                    
                    // Delete old thumbnail if it exists and it's not a page image
                    if (chapter.thumbnail && !chapter.pages.some(p => p.image === chapter.thumbnail)) {
                        const oldPublicId = this.extractPublicIdFromUrl(chapter.thumbnail);
                        if (oldPublicId) {
                            await CloudinaryUtils.deleteImage(oldPublicId);
                            console.log('Deleted old thumbnail:', oldPublicId);
                        }
                    }

                    // Upload new thumbnail
                    const thumbnailResult = await CloudinaryUtils.uploadImage(
                        thumbnailFile.buffer,
                        `manga/chapters/${chapter.mangaId._id}/thumbnails`,
                        `${chapter.mangaId._id}_chapter_${updateData.chapterNumber || chapter.chapterNumber}_thumbnail`
                    );
                    updateData.thumbnail = thumbnailResult.secure_url;
                    console.log('Thumbnail updated successfully:', updateData.thumbnail);
                } catch (thumbnailError) {
                    console.error('Failed to update thumbnail:', thumbnailError);
                    return {
                        status: 'error',
                        message: 'Failed to upload thumbnail: ' + thumbnailError.message
                    };
                }
            }

            // Handle page deletion
            let remainingPages = [...chapter.pages];
            if (chapterData.pagesToDelete) {
                try {
                    const pagesToDelete = JSON.parse(chapterData.pagesToDelete);
                    if (Array.isArray(pagesToDelete) && pagesToDelete.length > 0) {
                        console.log(`Deleting pages: ${pagesToDelete.join(', ')}`);
                        
                        // Delete images from Cloudinary (in background)
                        const pagesToRemove = chapter.pages.filter(p => pagesToDelete.includes(p.pageNumber));
                        this.deleteOldImages(pagesToRemove);
                        
                        // Remove from pages array
                        remainingPages = chapter.pages.filter(p => !pagesToDelete.includes(p.pageNumber));
                        
                        // Re-number remaining pages
                        remainingPages = remainingPages.map((page, index) => ({
                            pageNumber: index + 1,
                            image: page.image
                        }));
                        
                        console.log(`Remaining pages after deletion: ${remainingPages.length}`);
                        updateData.pages = remainingPages;
                    }
                } catch (parseError) {
                    console.error('Failed to parse pagesToDelete:', parseError);
                }
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

                console.log(`Uploading ${files.length} new images...`);

                // Sort new files by page number
                const sortedFiles = files.sort((a, b) => {
                    const pageA = this.extractPageNumber(a.originalname);
                    const pageB = this.extractPageNumber(b.originalname);
                    return pageA - pageB;
                });

                // Upload new images with batch processing
                const batchSize = 15;
                const newPages = [];
                const startPageNumber = remainingPages.length + 1;
                
                for (let i = 0; i < sortedFiles.length; i += batchSize) {
                    const batch = sortedFiles.slice(i, i + batchSize);
                    console.log(`Uploading batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(sortedFiles.length/batchSize)}`);
                    
                    const batchPromises = batch.map(async (file, batchIndex) => {
                        const actualIndex = i + batchIndex;
                        const pageNumber = startPageNumber + actualIndex;
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
                    newPages.push(...batchResults);
                }

                // Sort new pages by page number
                newPages.sort((a, b) => a.pageNumber - b.pageNumber);
                
                // Combine remaining pages with new pages
                updateData.pages = [...remainingPages, ...newPages];
                console.log(`Total pages after update: ${updateData.pages.length}`);

                // If no thumbnail was set and pages updated, use first page as thumbnail
                if (!updateData.thumbnail && updateData.pages.length > 0) {
                    updateData.thumbnail = updateData.pages[0].image;
                }
            }

            // Update updatedAt timestamp
            updateData.updatedAt = new Date();

            console.log('Update data:', updateData);

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
            // Extract the full path including folders
            const matches = url.match(/upload\/(?:v\d+\/)?(.+)\.\w+$/);
            return matches ? matches[1] : null;
        } catch (error) {
            return null;
        }
    }

    async deleteChapter(chapterId, userId) {
        try {
            const chapter = await Chapter.findById(chapterId).populate('mangaId');
            
            if (!chapter) {
                return {
                    status: 'error',
                    message: 'Chapter not found'
                };
            }

            // Check authorization
            if (chapter.mangaId.uploaderId.toString() !== userId.toString()) {
                return {
                    status: 'error',
                    message: 'Not authorized to delete this chapter'
                };
            }

            const mangaId = chapter.mangaId._id;

            // Delete images from Cloudinary
            await this.deleteOldImages(chapter.pages);
            if (chapter.thumbnail && !chapter.pages.some(p => p.image === chapter.thumbnail)) {
                const thumbnailPublicId = this.extractPublicIdFromUrl(chapter.thumbnail);
                if (thumbnailPublicId) {
                    await CloudinaryUtils.deleteImage(thumbnailPublicId);
                }
            }

            // Delete chapter
            await Chapter.findByIdAndDelete(chapterId);

            // Update manga: decrement chapterCount and recalculate progress
            const updatedManga = await Manga.findByIdAndUpdate(
                mangaId,
                { 
                    $inc: { chapterCount: -1 },
                },
                { new: true }
            );

            // Calculate progress with 2 decimal places
            let progress = 0;
            if (updatedManga.rawCount > 0) {
                progress = Math.round((updatedManga.chapterCount / updatedManga.rawCount) * 100 * 100) / 100;
                progress = Math.min(progress, 100);
            }

            await Manga.findByIdAndUpdate(mangaId, { progress });

            return {
                status: 'success',
                message: 'Chapter deleted successfully'
            };

        } catch (error) {
            console.error('Delete chapter error:', error);
            return {
                status: 'error',
                message: 'Failed to delete chapter: ' + error.message
            };
        }
    }

    async getChapterCountByUploader(uploaderId) {
        try {
            // Tìm tất cả manga của uploader
            const mangas = await Manga.find({ uploaderId: uploaderId }).select('_id');
            
            if (!mangas || mangas.length === 0) {
                return {
                    status: 'success',
                    data: {
                        uploaderId: uploaderId,
                        totalChapters: 0,
                        totalMangas: 0
                    }
                };
            }

            const mangaIds = mangas.map(manga => manga._id);
            
            // Đếm số chapter thuộc các manga của uploader
            const chapterCount = await Chapter.countDocuments({ 
                mangaId: { $in: mangaIds } 
            });

            return {
                status: 'success',
                data: {
                    uploaderId: uploaderId,
                    totalChapters: chapterCount,
                    totalMangas: mangas.length
                }
            };

        } catch (error) {
            console.error('Get chapter count error:', error);
            return {
                status: 'error',
                message: 'Failed to get chapter count: ' + error.message
            };
        }
    }
}

module.exports = new ChapterService();