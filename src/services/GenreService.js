const Genre = require('../models/Genre');

class GenreService {
    async getAllGenres() {
        return await Genre.find();
    }

    async getGenreById(id) {
        return await Genre.findById(id);
    }

    async createGenre(data) {
        const genre = new Genre(data);
        await genre.save();
        return genre;
    }

    async updateGenre(id, updates) {
        return await Genre.findByIdAndUpdate(id, updates, { new: true });
    }

    async deleteGenre(id) {
        return await Genre.findByIdAndDelete(id);
    }
}

module.exports = new GenreService();
