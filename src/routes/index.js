const AuthRouter = require('./AuthRouter');
const MangaRouter = require('./MangaRouter');
const UserRouter = require('./UserRouter');
const GenreRouter = require('./GenreRouter');

const routes = (app) => {
    app.use('/api/auth', AuthRouter);
    app.use('/api/mangas', MangaRouter);
    app.use('/api/users', UserRouter);
    app.use('/api/genres', GenreRouter);
}

module.exports = routes;