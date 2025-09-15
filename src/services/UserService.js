const AuthService = require('./AuthService');

class UserService {
    async getAllUsers() {
        return await User.find().select('-password');
    }

    async getUserById(id) {
        return await User.findById(id).select('-password');
    }

    async createUser(data) {
        const userData = { ...data };
        if (!userData.confirmPassword && userData.password) {
            userData.confirmPassword = userData.password;
        }
        const result = await AuthService.register(userData);
        if (result.status === 'success') {
            const user = result.data;
            return { ...user._doc, password: undefined };
        } else {
            throw new Error(result.message);
        }
    }

    async updateUser(id, updates) {
        return await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    }

    async deleteUser(id) {
        return await User.findByIdAndDelete(id);
    }

    async followManga(id, mangaId) {
        return await User.findByIdAndUpdate(
            id,
            { $addToSet: { followedMangas: mangaId } },
            { new: true }
        );
    }

    async unfollowManga(id, mangaId) {
        return await User.findByIdAndUpdate(
            id,
            { $pull: { followedMangas: mangaId } },
            { new: true }
        );
    }

    async updateReadingHistory(id, manga, chapterId) {
        const user = await User.findById(id);
        if (!user) return null;
        user.readingHistory = user.readingHistory.filter(h => h.manga.toString() !== manga);
        user.readingHistory.push({ manga, chapterId, lastReadAt: new Date() });
        await user.save();
        return user;
    }

    async getReadingHistory(id) {
        const user = await User.findById(id).select('readingHistory');
        return user ? user.readingHistory : null;
    }

    async getUploadedMangas(id) {
        const user = await User.findById(id).populate('uploadedMangas');
        return user ? user.uploadedMangas : null;
    }
}

module.exports = new UserService();