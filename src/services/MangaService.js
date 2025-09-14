const Manga = require('../models/Manga');
const CloudinaryUtils = require('../utils/CloudinaryUtils');

class MangaService {
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

    extractPublicIdFromUrl(url) {
        const matches = url.match(/\/([^/]+)\.[^.]+$/);
        return matches ? matches[1] : null;
    }
}

module.exports = new MangaService();