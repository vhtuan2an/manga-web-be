const AuthRouter = require('./AuthRouter');
const MangaRouter = require('./MangaRouter');

const routes = (app) => {
    app.use('/api/auth', AuthRouter);
    app.use('/api/manga', MangaRouter);
}

module.exports = routes;