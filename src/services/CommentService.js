const Comment = require('../models/Comment');
const UserService = require('./UserService');
const Manga = require('../models/Manga');

class CommentService {
    async getCommentsByUploader(uploaderId) {
        // 1. Get all mangas uploaded by this user
        const mangas = await Manga.find({ uploaderId: uploaderId }).select('_id title');
        const mangaIds = mangas.map(m => m._id);

        // 2. Find comments where manga is in mangaIds
        const comments = await Comment.find({ manga: { $in: mangaIds } })
            .populate('user', 'username avatar')
            .populate('manga', 'title')
            .populate('chapter', 'chapterNumber title')
            .sort({ createdAt: -1 });

        return {
            status: 'success',
            data: comments
        };
    }

    async createComment(data) {
        const { userId, manga, chapter, content } = data;
        if (!userId) {
            return { status: 'error', message: 'User id required' };
        }
        if (!content || !content.trim()) {
            return { status: 'error', message: 'Content is required' };
        }
        if (!manga && !chapter) {
            return { status: 'error', message: 'Must specify either manga or chapter' };
        }

        const userResult = await UserService.getUserById(userId);
        if (userResult.status === 'error') {
            return { status: 'error', message: 'User not found' };
        }
        const user = userResult.data;

        const allowedRoles = ['reader', 'uploader', 'admin'];
        if (!allowedRoles.includes(user.role)) {
            return { status: 'error', message: 'User role not permitted to comment' };
        }

        // Create and save comment
        const comment = new Comment({
            user: userId,
            manga: manga || undefined,
            chapter: chapter || undefined,
            content: content.trim()
        });
        await comment.save();
        const populated = await comment.populate('user', 'username role');
        return { status: 'success', data: populated };
    }

    async getCommentsByManga(mangaId) {
        const comments = await Comment.find({ manga: mangaId }).populate('user', 'username').sort({ createdAt: -1 });
        return {
            status: 'success',
            data: comments
        };
    }

    async getCommentsByChapter(chapterId) {
        const comments = await Comment.find({ chapter: chapterId }).populate('user', 'username').sort({ createdAt: -1 });
        return {
            status: 'success',
            data: comments
        };
    }

    async getCommentById(id) {
        const comment = await Comment.findById(id).populate('user', 'username');
        return {
            status: 'success',
            data: comment
        };
    }

    async updateComment(id, userId, content) {
        // Only allow the owner to update
        const comment = await Comment.findOneAndUpdate(
            { _id: id, user: userId },
            { content, updatedAt: new Date() },
            { new: true }
        );
        return {
            status: 'success',
            data: comment
        };
    }

    async deleteComment(id, userId) {
        const comment = await Comment.findOneAndDelete({ _id: id, user: userId });
        return {
            status: 'success',
            data: comment
        };
    }
}

module.exports = new CommentService();