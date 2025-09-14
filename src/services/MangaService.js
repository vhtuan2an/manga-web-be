const Manga = require('../models/Manga');
const CloudinaryUtils = require('../utils/CloudinaryUtils');
const mongoose = require('mongoose');
const Genre = require('../models/Genre');

class MangaService {
    // Helper function to extract public ID from Cloudinary URL to delete images
    extractPublicIdFromUrl(url) {
        const matches = url.match(/\/([^/]+)\.[^.]+$/);
        return matches ? matches[1] : null;
    }

    async createManga(mangaData, coverImageBuffer = null) {
        try {
            let coverImage = '';
            
            // Upload cover image if provided
            if (coverImageBuffer) {
                const uploadResult = await CloudinaryUtils.uploadImage(
                    coverImageBuffer, 
                    'manga/covers', 
                    `cover_${Date.now()}`
                );
                coverImage = uploadResult.secure_url;
            }

            const manga = new Manga({
                ...mangaData,
                coverImage: coverImage || mangaData.coverImage || ''
            });
            
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

    async updateMangaCover(mangaId, coverImageBuffer) {
        try {
            const manga = await Manga.findById(mangaId);
            if (!manga) {
                return {
                    status: 'error',
                    message: 'Manga not found'
                };
            }

            // Delete old cover if exists
            if (manga.coverImage) {
                const publicId = this.extractPublicIdFromUrl(manga.coverImage);
                if (publicId) {
                    await CloudinaryUtils.deleteImage(publicId);
                }
            }

            // Upload new cover
            const uploadResult = await CloudinaryUtils.uploadImage(
                coverImageBuffer, 
                'manga/covers', 
                `cover_${mangaId}`
            );

            manga.coverImage = uploadResult.secure_url;
            await manga.save();

            return {
                status: 'success',
                message: 'Cover image updated successfully',
                data: manga
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Failed to update cover: ' + error.message
            };
        }
    }

    async getMangaList(filter = {}) {
        try {
            const { 
                page = 1, 
                limit = 20, 
                genre, 
                status, 
                sortBy = 'updatedAt:desc' 
            } = filter;

            const query = {};
            
            // Filter by genre
            if (genre) {
                // Assuming genre is passed as genre name or ObjectId
                if (mongoose.Types.ObjectId.isValid(genre)) {
                    query.genres = { $in: [new mongoose.Types.ObjectId(genre)] };
                }
            }
            
            // Filter by status
            if (status) {
                query.status = status;
            }

            // Parse sort parameter
            let sortOptions = {};
            if (sortBy) {
                const [field, order] = sortBy.split(':');
                sortOptions[field] = order === 'desc' ? -1 : 1;
            } else {
                sortOptions.updatedAt = -1; // Default sort by updatedAt desc
            }

            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const skip = (pageNum - 1) * limitNum;

            // Execute query with pagination
            const mangas = await Manga.find(query)
                .populate('genres', 'name')
                .populate('uploaderId', 'username')
                .skip(skip)
                .limit(limitNum)
                .sort(sortOptions)
                .lean();

            // Get total count for pagination
            const totalItems = await Manga.countDocuments(query);
            const totalPages = Math.ceil(totalItems / limitNum);

            return {
                status: 'success',
                data: {
                    mangas,
                    pagination: {
                        currentPage: pageNum,
                        totalPages,
                        totalItems
                    }
                }
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Failed to retrieve manga list: ' + error.message
            };
        }
    }

    async getMangaById(mangaId) {
        try {
            const manga = await Manga.findById(mangaId)
                .populate('genres', 'name')
                .populate('uploaderId', 'username email')
                .lean();

            if (!manga) {
                return {
                    status: 'error',
                    message: 'Manga not found'
                };
            }

            return {
                status: 'success',
                data: manga
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Failed to retrieve manga details: ' + error.message
            };
        }
    }
}

module.exports = new MangaService();