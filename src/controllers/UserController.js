const UserService = require('../services/UserService');

class UserController {
    async getAllUsers(req, res) {
        try {
            const users = await UserService.getAllUsers();
            res.json(users);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error: ' + error.message
            });
        }
    }

    async getUserById(req, res) {
        try {
            const user = await UserService.getUserById(req.params.id);
            if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
            res.json(user);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error: ' + error.message
            });
        }
    }

    async updateUser(req, res) {
        try {
            const user = await UserService.updateUser(req.params.id, req.body);
            if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
            res.json(user);
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: 'Bad request: ' + error.message
            });
        }
    }

    async deleteUser(req, res) {
        try {
            const user = await UserService.deleteUser(req.params.id);
            if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
            res.json({ message: 'User deleted' });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error: ' + error.message
            });
        }
    }

    async followManga(req, res) {
        try {
            const { mangaId } = req.body;
            const user = await UserService.followManga(req.params.id, mangaId);
            res.json(user);
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: 'Bad request: ' + error.message
            });
        }
    }

    async unfollowManga(req, res) {
        try {
            const { mangaId } = req.body;
            const user = await UserService.unfollowManga(req.params.id, mangaId);
            res.json(user);
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: 'Bad request: ' + error.message
            });
        }
    }

    async getReadingHistory(req, res) {
        try {
            const history = await UserService.getReadingHistory(req.params.id);
            if (!history) return res.status(404).json({ status: 'error', message: 'User not found' });
            res.json(history);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error: ' + error.message
            });
        }
    }

    async updateReadingHistory(req, res) {
        try {
            const { manga, chapterId } = req.body;
            const user = await UserService.updateReadingHistory(req.params.id, manga, chapterId);
            if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
            res.json(user);
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: 'Bad request: ' + error.message
            });
        }
    }

    async getUploadedMangas(req, res) {
        try {
            const mangas = await UserService.getUploadedMangas(req.params.id);
            if (!mangas) return res.status(404).json({ status: 'error', message: 'User not found' });
            res.json(mangas);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error: ' + error.message
            });
        }
    }
}

module.exports = new UserController();