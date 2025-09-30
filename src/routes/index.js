const AuthRouter = require('./AuthRouter');
const MangaRouter = require('./MangaRouter');
const ChapterRouter = require('./ChapterRouter');
const UserRouter = require('./UserRouter');
const GenreRouter = require('./GenreRouter');
const CommentRouter = require('./CommentRouter');
const RatingRouter = require('./RatingRouter');

const routes = (app) => {
    app.use('/api/auth', AuthRouter);
    app.use('/api/mangas', MangaRouter);
    app.use('/api/chapters', ChapterRouter);
    app.use('/api/users', UserRouter);
    app.use('/api/genres', GenreRouter);
    app.use('/api/comments', CommentRouter);
    app.use('/api/ratings', RatingRouter);
}

module.exports = routes;