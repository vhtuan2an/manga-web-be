const Genre = require('../models/Genre');
const Manga = require('../models/Manga');

class GenreService {
    async getAllGenres() {
        try {
            const genres = await Genre.find();
            
            // Get manga count for each genre
            const genresWithCount = await Promise.all(
                genres.map(async (genre) => {
                    const mangaCount = await Manga.countDocuments({ 
                        genres: genre._id 
                    });
                    
                    return {
                        _id: genre._id,
                        name: genre.name,
                        description: genre.description,
                        mangaCount: mangaCount,
                        createdAt: genre.createdAt,
                        updatedAt: genre.updatedAt
                    };
                })
            );
            
            return genresWithCount;
        } catch (error) {
            throw error;
        }
    }

    async getGenreById(id) {
        try {
            const genre = await Genre.findById(id);
            if (!genre) return null;
            
            // Get manga count for this genre
            const mangaCount = await Manga.countDocuments({ 
                genres: genre._id 
            });
            
            return {
                _id: genre._id,
                name: genre.name,
                description: genre.description,
                mangaCount: mangaCount,
                createdAt: genre.createdAt,
                updatedAt: genre.updatedAt
            };
        } catch (error) {
            throw error;
        }
    }

    async createGenre(genreData) {
        try {
            const genre = new Genre(genreData);
            await genre.save();
            return {
                ...genre.toObject(),
                mangaCount: 0
            };
        } catch (error) {
            throw error;
        }
    }

    async updateGenre(id, genreData) {
        try {
            const genre = await Genre.findByIdAndUpdate(id, genreData, { new: true });
            if (!genre) return null;
            
            const mangaCount = await Manga.countDocuments({ 
                genres: genre._id 
            });
            
            return {
                ...genre.toObject(),
                mangaCount: mangaCount
            };
        } catch (error) {
            throw error;
        }
    }

    async deleteGenre(id) {
        try {
            return await Genre.findByIdAndDelete(id);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new GenreService();
