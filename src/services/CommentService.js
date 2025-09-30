const Comment = require('../models/Comment');
const AuthService = require('./AuthService');

class CommentService {
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

        const userResult = await AuthService.getUserById(userId);
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