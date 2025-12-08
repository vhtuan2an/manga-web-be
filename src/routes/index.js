const AuthRouter = require('./AuthRouter');
const UserRouter = require('./UserRouter');
const MangaRouter = require('./MangaRouter');
const GenreRouter = require('./GenreRouter');
const ChapterRouter = require('./ChapterRouter');
const CommentRouter = require('./CommentRouter');
const RatingRouter = require('./RatingRouter');
const AIRouter = require('./AIRouter');
const ReportRouter = require('./ReportRouter');
const StatisticsRouter = require('./StatisticsRouter');

const routes = (app) => {
    app.use('/api/auth', AuthRouter);
    app.use('/api/users', UserRouter);
    app.use('/api/mangas', MangaRouter);
    app.use('/api/genres', GenreRouter);
    app.use('/api/chapters', ChapterRouter);
    app.use('/api/comments', CommentRouter);
    app.use('/api/ratings', RatingRouter);
    app.use('/api/ai', AIRouter);
    app.use('/api/reports', ReportRouter);
    app.use('/api/statistics', StatisticsRouter);
};

module.exports = routes;