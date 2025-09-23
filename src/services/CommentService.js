const Comment = require('../models/Comment');
const AuthService = require('./AuthService');

class CommentService {
    async createComment(data) {
        const { userId, manga, chapter, content, accessToken } = data;
        if (!userId && !accessToken) {
            return { status: 'error', message: 'Missing auth token' };
        }
        else if (!content) {
            return { status: 'error', message: 'Missing content' };
        }
        else if (!manga && !chapter) {
            return { status: 'error', message: 'Must specify either manga or chapter' };
        }
        const comment = new Comment({ user: userId, manga, chapter, content });
        await comment.save();
        return { status: 'success', data: comment };
    }

    async getCommentsByManga(mangaId) {
        return await Comment.find({ manga: mangaId }).populate('user', 'username').sort({ createdAt: -1 });
    }

    async getCommentsByChapter(chapterId) {
        return await Comment.find({ chapter: chapterId }).populate('user', 'username').sort({ createdAt: -1 });
    }

    async getCommentById(id) {
        return await Comment.findById(id).populate('user', 'username');
    }

    async updateComment(id, userId, content) {
        // Only allow the owner to update
        return await Comment.findOneAndUpdate(
            { _id: id, user: userId },
            { content, updatedAt: new Date() },
            { new: true }
        );
    }

    async deleteComment(id, userId) {
        return await Comment.findOneAndDelete({ _id: id, user: userId });
    }
}

module.exports = new CommentService();
