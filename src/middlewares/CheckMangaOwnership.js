// src/middlewares/OwnershipMiddleware.js
const MangaService = require('../services/MangaService');

const checkMangaOwnership = async (req, res, next) => {
    try {
        const mangaId = req.params.id;
        const userId = req.id;
        const userRole = req.role;

        // Admin có thể làm mọi thứ
        if (userRole === 'admin') {
            return next();
        }

        // Uploader chỉ có thể thao tác với manga của mình
        if (userRole === 'uploader') {
            const manga = await MangaService.getMangaById(mangaId);
            if (manga.status === 'error') {
                return res.status(404).json(manga);
            }

            if (manga.data.uploaderId._id.toString() !== userId.toString()) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied: You can only modify your own manga'
                });
            }
        }

        next();
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error: ' + error.message
        });
    }
};

module.exports = {
    checkMangaOwnership
};