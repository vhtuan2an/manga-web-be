const AuthRouter = require('./AuthRouter');
const MangaRouter = require('./MangaRouter');

const routes = (app) => {
    app.use('/api/auth', AuthRouter);
    app.use('/api/mangas', MangaRouter);
}

module.exports = routes;