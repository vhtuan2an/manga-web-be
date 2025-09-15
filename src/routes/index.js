const AuthRouter = require('./AuthRouter');
const MangaRouter = require('./MangaRouter');
const ChapterRouter = require('./ChapterRouter');

const routes = (app) => {
    app.use('/api/auth', AuthRouter);
    app.use('/api/mangas', MangaRouter);
    app.use('/api/chapters', ChapterRouter);
}

module.exports = routes;