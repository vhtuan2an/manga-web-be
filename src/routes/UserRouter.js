const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authMiddleware } = require('../middlewares/AuthMiddleware');

// Public route
router.get('/', UserController.getAllUsers);

// Authenticated user operations (uses req.user.id from authMiddleware)
router.get('/profile', authMiddleware(['reader', 'uploader', 'admin']), UserController.getMyProfile);
router.put('/profile', authMiddleware(['reader', 'uploader', 'admin']), UserController.updateMyProfile);
router.delete('/profile', authMiddleware(['reader', 'uploader', 'admin']), UserController.deleteMyProfile);

router.post('/follow', authMiddleware(['reader', 'uploader', 'admin']), UserController.followManga);
router.post('/unfollow', authMiddleware(['reader', 'uploader', 'admin']), UserController.unfollowManga);

router.get('/reading-history', authMiddleware(['reader', 'uploader', 'admin']), UserController.getMyReadingHistory);
router.post('/reading-history', authMiddleware(['reader', 'uploader', 'admin']), UserController.updateMyReadingHistory);

router.get('/uploaded-mangas', authMiddleware(['uploader', 'admin']), UserController.getMyUploadedMangas);

// Admin operations on other users by ID in body
router.put('/admin/update', authMiddleware(['admin']), UserController.updateUserById);
router.delete('/admin/delete', authMiddleware(['admin']), UserController.deleteUserById);
router.get('/admin/user', authMiddleware(['admin']), UserController.getUserById);

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
 *     summary: Get all users with pagination
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [reader, uploader, admin]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users with pagination
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get my profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update my profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *         description: Profile updated
 */

/**
 * @swagger
 * /api/users/profile:
 *   delete:
 *     summary: Delete my account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted
 */

/**
 * @swagger
 * /api/users/follow:
 *   post:
 *     summary: Follow a manga
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Manga followed
 */

/**
 * @swagger
 * /api/users/unfollow:
 *   post:
 *     summary: Unfollow a manga
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Manga unfollowed
 */

/**
 * @swagger
 * /api/users/reading-history:
 *   get:
 *     summary: Get my reading history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reading history
 */

/**
 * @swagger
 * /api/users/reading-history:
 *   post:
 *     summary: Update my reading history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *               chapterId:
 *                 type: string
 *     responses:
 *       200:
 *         description: History updated
 */

/**
 * @swagger
 * /api/users/uploaded-mangas:
 *   get:
 *     summary: Get my uploaded mangas
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of uploaded mangas
 */

/**
 * @swagger
 * /api/users/admin/user:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to fetch
 *     responses:
 *       200:
 *         description: User information
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/admin/update:
 *   put:
 *     summary: Update user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to update
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [reader, uploader, admin]
 *               avatarUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 */

/**
 * @swagger
 * /api/users/admin/delete:
 *   delete:
 *     summary: Delete user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to delete
 *     responses:
 *       200:
 *         description: User deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin only)
 */