const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authMiddleware } = require('../middlewares/AuthMiddleware');

// Public route
router.get('/', UserController.getAllUsers);

// Authenticated user operations (uses req.id from authMiddleware)
router.get('/profile', authMiddleware(['reader', 'uploader', 'admin']), UserController.getMyProfile);
router.put('/profile', authMiddleware(['reader', 'uploader', 'admin']), UserController.updateMyProfile);
router.delete('/profile', authMiddleware(['reader', 'uploader', 'admin']), UserController.deleteMyProfile);

router.post('/follow', authMiddleware(['reader', 'uploader', 'admin']), UserController.followManga);
router.post('/unfollow', authMiddleware(['reader', 'uploader', 'admin']), UserController.unfollowManga);
router.post('/unfollow-batch', authMiddleware(['reader', 'uploader', 'admin']), UserController.unfollowMangaBatch);
router.get('/followed-mangas', authMiddleware(['reader', 'uploader', 'admin']), UserController.getMyFollowedMangas);

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
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: User ID
 *         username:
 *           type: string
 *           description: Username
 *         email:
 *           type: string
 *           description: Email address
 *         role:
 *           type: string
 *           enum: [reader, uploader, admin]
 *           description: User role
 *         avatarUrl:
 *           type: string
 *           description: Avatar image URL
 *         followedMangas:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of followed manga IDs
 *         uploadedMangas:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of uploaded manga IDs
 *         readingHistory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               manga:
 *                 type: string
 *               chapterId:
 *                 type: string
 *               lastReadAt:
 *                 type: string
 *                 format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Manga:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         author:
 *           type: string
 *         artist:
 *           type: string
 *         coverImage:
 *           type: string
 *         status:
 *           type: string
 *           enum: [ongoing, completed, hiatus]
 *         viewCount:
 *           type: number
 *         followedCount:
 *           type: number
 *         averageRating:
 *           type: number
 *         genres:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name:
 *                 type: string
 *         uploader:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *             avatarUrl:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination and filters
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [reader, uploader, admin]
 *         description: Filter by user role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by username or email
 *     responses:
 *       200:
 *         description: List of users with pagination
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
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *                     totalItems:
 *                       type: number
 *                     itemsPerPage:
 *                       type: number
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       500:
 *         description: Internal server error
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
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       404:
 *         description: User not found
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
 *                 example: new_username
 *               email:
 *                 type: string
 *                 example: newemail@example.com
 *               avatarUrl:
 *                 type: string
 *                 example: https://example.com/avatar.jpg
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Invalid data
 *       401:
 *         description: Unauthorized
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
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
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
 *                 description: ID of the manga to follow
 *                 example: 692ead72b2d959c9f59833ce
 *     responses:
 *       200:
 *         description: Manga followed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Invalid manga ID
 *       401:
 *         description: Unauthorized
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
 *                 description: ID of the manga to unfollow
 *                 example: 692ead72b2d959c9f59833ce
 *     responses:
 *       200:
 *         description: Manga unfollowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Invalid manga ID
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/users/unfollow-batch:
 *   post:
 *     summary: Unfollow multiple mangas at once
 *     description: Remove multiple mangas from the authenticated user's followed list in a single request
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
 *               - mangaIds
 *             properties:
 *               mangaIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of manga IDs to unfollow
 *                 example: ["692ead72b2d959c9f59833ce", "692ead72b2d959c9f59833cf", "692ead72b2d959c9f59833d0"]
 *     responses:
 *       200:
 *         description: Mangas unfollowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Successfully unfollowed 3 manga(s)
 *                 data:
 *                   type: object
 *                   properties:
 *                     unfollowedCount:
 *                       type: number
 *                       description: Number of mangas that were actually unfollowed
 *                       example: 3
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - mangaIds must be a non-empty array
 *       401:
 *         description: Unauthorized - Token missing or invalid
 */

/**
 * @swagger
 * /api/users/followed-mangas:
 *   get:
 *     summary: Get my followed/favorite mangas
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of followed mangas retrieved successfully
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
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/reading-history:
 *   get:
 *     summary: Get my reading history with progress
 *     description: Retrieve the authenticated user's reading history with manga details, current chapter, and reading progress percentage
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reading history retrieved successfully
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
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 692ead72b2d959c9f59833ce
 *                           title:
 *                             type: string
 *                             example: One Piece
 *                           coverImage:
 *                             type: string
 *                             example: https://example.com/cover.jpg
 *                           status:
 *                             type: string
 *                             enum: [ongoing, completed]
 *                             example: ongoing
 *                           totalChapters:
 *                             type: number
 *                             example: 100
 *                           genres:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                       currentChapter:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 674f5678901234abcdef5678
 *                           chapterNumber:
 *                             type: number
 *                             example: 50
 *                             description: The chapter number user is currently reading
 *                           title:
 *                             type: string
 *                             example: Chapter 50 - The Battle
 *                       lastReadAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-12-19T10:30:00.000Z
 *                       progress:
 *                         type: number
 *                         description: Reading progress percentage calculated as (currentChapter - minChapter + 1) / totalChapters * 100. Works correctly for manga starting from chapter 0 or chapter 1.
 *                         example: 50
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
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
 *                 description: Manga ID
 *                 example: 692ead72b2d959c9f59833ce
 *               chapterId:
 *                 type: string
 *                 description: Chapter ID
 *                 example: 674f5678901234abcdef5678
 *     responses:
 *       200:
 *         description: Reading history updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Invalid data
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/users/uploaded-mangas:
 *   get:
 *     summary: Get my uploaded mangas (uploader/admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of uploaded mangas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Manga'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an uploader or admin
 *       404:
 *         description: User not found
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
 *         example: 674f1234567890abcdef1234
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - userId is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
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
 *                 example: 674f1234567890abcdef1234
 *               username:
 *                 type: string
 *                 example: updated_username
 *               email:
 *                 type: string
 *                 example: updated@example.com
 *               role:
 *                 type: string
 *                 enum: [reader, uploader, admin]
 *                 example: uploader
 *               avatarUrl:
 *                 type: string
 *                 example: https://example.com/new-avatar.jpg
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - userId is required or invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
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
 *                 example: 674f1234567890abcdef1234
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User deleted
 *       400:
 *         description: Bad request - userId is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: User not found
 */