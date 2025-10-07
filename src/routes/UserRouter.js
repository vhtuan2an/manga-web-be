const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

router.post('/:id/follow', UserController.followManga);
router.post('/:id/unfollow', UserController.unfollowManga);

router.get('/:id/reading-history', UserController.getReadingHistory);
router.post('/:id/reading-history', UserController.updateReadingHistory);

router.get('/:id/uploaded-mangas', UserController.getUploadedMangas);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profile endpoints
 */

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
 *     summary: Update user profile
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
 *                 example: new_username
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newemail@example.com
 *               avatarUrl:
 *                 type: string
 *                 example: https://example.com/new-avatar.jpg
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       400:
 *         description: Bad request
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
 *       400:
 *         description: Bad request
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
 *       400:
 *         description: Bad request
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       manga:
 *                         $ref: '#/components/schemas/Manga'
 *                       lastChapterRead:
 *                         type: string
 *                       readAt:
 *                         type: string
 *                         format: date-time
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
 *                 description: Chapter ID that was read
 *     responses:
 *       200:
 *         description: Reading history updated
 *       404:
 *         description: User not found
 *       400:
 *         description: Bad request
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Manga'
 *       404:
 *         description: User not found
 */