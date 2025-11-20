const UserService = require('../services/UserService');

class UserController {
    async getAllUsers(req, res) {
        try {
            const filter = req.query;
            const result = await UserService.getAllUsers(filter);
            res.json(result);
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

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/{id}/follow:
 *   post:
 *     summary: Follow a manga
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mangaId
 *             properties:
 *               mangaId:
 *                 type: string
 *                 description: ID of the manga to follow
 *     responses:
 *       200:
 *         description: Successfully followed manga
 */

/**
 * @swagger
 * /api/users/{id}/unfollow:
 *   post:
 *     summary: Unfollow a manga
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mangaId
 *             properties:
 *               mangaId:
 *                 type: string
 *                 description: ID of the manga to unfollow
 *     responses:
 *       200:
 *         description: Successfully unfollowed manga
 */

/**
 * @swagger
 * /api/users/{id}/reading-history:
 *   get:
 *     summary: Get user's reading history
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User's reading history
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/{id}/reading-history:
 *   post:
 *     summary: Update reading history
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - manga
 *               - chapterId
 *             properties:
 *               manga:
 *                 type: string
 *                 description: Manga ID
 *               chapterId:
 *                 type: string
 *                 description: Chapter ID
 *     responses:
 *       200:
 *         description: Reading history updated
 */

/**
 * @swagger
 * /api/users/{id}/uploaded-mangas:
 *   get:
 *     summary: Get user's uploaded mangas
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of uploaded mangas
 *       404:
 *         description: User not found
 */