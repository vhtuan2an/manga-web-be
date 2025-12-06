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

    // User operations (uses req.id from authMiddleware)
    async getMyProfile(req, res) {
        try {
            const user = await UserService.getUserById(req.id);
            res.json(user);
        } catch (error) {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async updateMyProfile(req, res) {
        try {
            const user = await UserService.updateUser(req.id, req.body);
            res.json(user);
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async deleteMyProfile(req, res) {
        try {
            await UserService.deleteUser(req.id);
            res.json({ status: 'success', message: 'User deleted' });
        } catch (error) {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async followManga(req, res) {
        try {
            const result = await UserService.followManga(req.id, req.body.mangaId);
            res.json(result);
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async unfollowManga(req, res) {
        try {
            const result = await UserService.unfollowManga(req.id, req.body.mangaId);
            res.json(result);
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getMyReadingHistory(req, res) {
        try {
            const result = await UserService.getReadingHistory(req.id);
            res.json(result);
        } catch (error) {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async updateMyReadingHistory(req, res) {
        try {
            const { manga, chapterId } = req.body;
            const result = await UserService.updateReadingHistory(req.id, manga, chapterId);
            res.json(result);
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getMyUploadedMangas(req, res) {
        try {
            const result = await UserService.getUploadedMangas(req.id);
            res.json(result);
        } catch (error) {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getMyFollowedMangas(req, res) {
        try {
            const result = await UserService.getFollowedMangas(req.id);
            res.json(result);
        } catch (error) {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
    }

    // Admin operations (uses userId from req.query or req.body)
    async getUserById(req, res) {
        try {
            const userId = req.query.userId;
            if (!userId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'userId is required'
                });
            }
            const user = await UserService.getUserById(userId);
            res.json(user);
        } catch (error) {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async updateUserById(req, res) {
        try {
            const { userId, ...updateData } = req.body;
            if (!userId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'userId is required'
                });
            }
            const user = await UserService.updateUser(userId, updateData);
            res.json(user);
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async deleteUserById(req, res) {
        try {
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'userId is required'
                });
            }
            await UserService.deleteUser(userId);
            res.json({ status: 'success', message: 'User deleted' });
        } catch (error) {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
    }
}

module.exports = new UserController();

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
 *           example: 674f1234567890abcdef1234
 *         username:
 *           type: string
 *           description: Username
 *           example: john_doe
 *         email:
 *           type: string
 *           description: Email address
 *           example: john@example.com
 *         role:
 *           type: string
 *           enum: [reader, uploader, admin]
 *           description: User role
 *           example: reader
 *         avatarUrl:
 *           type: string
 *           description: Avatar image URL
 *           example: https://example.com/avatar.jpg
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
 *                 description: Manga ID
 *               chapterId:
 *                 type: string
 *                 description: Chapter ID
 *               lastReadAt:
 *                 type: string
 *                 format: date-time
 *                 description: Last read timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2024-12-02T10:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2024-12-02T10:00:00.000Z
 *     MangaPopulated:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 692ead72b2d959c9f59833ce
 *         title:
 *           type: string
 *           example: One Piece
 *         description:
 *           type: string
 *           example: Epic pirate adventure
 *         author:
 *           type: string
 *           example: Eiichiro Oda
 *         artist:
 *           type: string
 *           example: Eiichiro Oda
 *         coverImage:
 *           type: string
 *           example: https://res.cloudinary.com/.../cover.jpg
 *         status:
 *           type: string
 *           enum: [ongoing, completed, hiatus]
 *           example: ongoing
 *         viewCount:
 *           type: number
 *           example: 1500
 *         followedCount:
 *           type: number
 *           example: 250
 *         averageRating:
 *           type: number
 *           example: 4.8
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
 * tags:
 *   name: Users
 *   description: User management and profile endpoints
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
 *                       example: 1
 *                     totalPages:
 *                       type: number
 *                       example: 5
 *                     totalItems:
 *                       type: number
 *                       example: 50
 *                     itemsPerPage:
 *                       type: number
 *                       example: 10
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get my profile
 *     description: Get the profile of the currently authenticated user
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
 *     description: Update the profile of the currently authenticated user
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
 *                 description: New username
 *               email:
 *                 type: string
 *                 example: newemail@example.com
 *                 description: New email address
 *               avatarUrl:
 *                 type: string
 *                 example: https://example.com/new-avatar.jpg
 *                 description: New avatar URL
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
 *     description: Delete the currently authenticated user's account
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
 *     description: Add a manga to the authenticated user's followed list
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
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Manga followed successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Invalid manga ID or already following
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/users/unfollow:
 *   post:
 *     summary: Unfollow a manga
 *     description: Remove a manga from the authenticated user's followed list
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
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Manga unfollowed successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Invalid manga ID or not following
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/users/followed-mangas:
 *   get:
 *     summary: Get my followed/favorite mangas
 *     description: Retrieve all mangas that the authenticated user is following
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
 *                     $ref: '#/components/schemas/MangaPopulated'
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/reading-history:
 *   get:
 *     summary: Get my reading history
 *     description: Retrieve the authenticated user's reading history
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
 *                         type: string
 *                         description: Manga ID
 *                         example: 692ead72b2d959c9f59833ce
 *                       chapterId:
 *                         type: string
 *                         description: Chapter ID
 *                         example: 674f5678901234abcdef5678
 *                       lastReadAt:
 *                         type: string
 *                         format: date-time
 *                         description: Last read timestamp
 *                         example: 2024-12-02T14:30:00.000Z
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
 *     description: Add or update a chapter in the authenticated user's reading history
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
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Reading history updated
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Invalid manga or chapter ID
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/users/uploaded-mangas:
 *   get:
 *     summary: Get my uploaded mangas
 *     description: Get all mangas uploaded by the authenticated user (uploader/admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *                     $ref: '#/components/schemas/MangaPopulated'
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
 *     description: Retrieve a specific user's information by their ID
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
 *     description: Update any user's information (admin only)
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
 *                 description: New username
 *               email:
 *                 type: string
 *                 example: updated@example.com
 *                 description: New email
 *               role:
 *                 type: string
 *                 enum: [reader, uploader, admin]
 *                 example: uploader
 *                 description: New role
 *               avatarUrl:
 *                 type: string
 *                 example: https://example.com/new-avatar.jpg
 *                 description: New avatar URL
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
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users/admin/delete:
 *   delete:
 *     summary: Delete user by ID (Admin only)
 *     description: Delete any user account (admin only)
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