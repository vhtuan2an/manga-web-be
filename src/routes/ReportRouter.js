const ReportController = require("../controllers/ReportController");
const express = require("express");
const { authMiddleware } = require("../middlewares/AuthMiddleware");
const router = express.Router();

router.post(
  "/:mangaId",
  authMiddleware(["reader", "uploader", "admin"]),
  ReportController.reportManga
);

router.get("/", authMiddleware(["admin"]), ReportController.getAllReports);
router.get(
  "/manga/:mangaId",
  authMiddleware(["admin"]),
  ReportController.getReportsInManga
);
router.get(
  "/:reportId",
  authMiddleware(["admin"]),
  ReportController.getReportById
);

router.delete(
  "/:reportId",
  authMiddleware(["admin"]),
  ReportController.deleteReport
);

router.patch(
  "/:reportId/resolve",
  authMiddleware(["admin"]),
  ReportController.resolveReport
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Report management for content moderation
 */

/**
 * @swagger
 * /api/reports/{mangaId}:
 *   post:
 *     summary: Report a manga
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mangaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga ID to report
 *         example: 68c6acca082469de5b77fef0
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for reporting
 *                 example: Inappropriate content
 *     responses:
 *       201:
 *         description: Report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6913e5f33e100b12fe4d9d9f
 *                     mangaId:
 *                       type: string
 *                       example: 68c6acca082469de5b77fef0
 *                     userId:
 *                       type: string
 *                       example: 68d4ac7cd70d20a8840c5c5f
 *                     reason:
 *                       type: string
 *                       example: test
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-11-12T01:42:11.477Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-11-12T01:42:11.477Z
 *                     __v:
 *                       type: integer
 *                       example: 0
 *       400:
 *         description: Invalid report data
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all reports (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all reports
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
 *                       _id:
 *                         type: string
 *                       mangaId:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       reason:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       __v:
 *                         type: integer
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/reports/manga/{mangaId}:
 *   get:
 *     summary: Get all reports for a specific manga (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mangaId
 *         required: true
 *         schema:
 *           type: string
 *         description: Manga ID
 *         example: 68c6acca082469de5b77fef0
 *     responses:
 *       200:
 *         description: List of reports for the manga
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
 *                       _id:
 *                         type: string
 *                       mangaId:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       reason:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       __v:
 *                         type: integer
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Manga not found
 */

/**
 * @swagger
 * /api/reports/{reportId}:
 *   get:
 *     summary: Get report by ID (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *         example: 6913e5f33e100b12fe4d9d9f
 *     responses:
 *       200:
 *         description: Report details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6913e5f33e100b12fe4d9d9f
 *                     mangaId:
 *                       type: string
 *                       example: 68c6acca082469de5b77fef0
 *                     userId:
 *                       type: string
 *                       example: 68d4ac7cd70d20a8840c5c5f
 *                     reason:
 *                       type: string
 *                       example: test
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-11-12T01:42:11.477Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-11-12T01:42:11.477Z
 *                     __v:
 *                       type: integer
 *                       example: 0
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Report not found
 */

/**
 * @swagger
 * /api/reports/{reportId}:
 *   delete:
 *     summary: Delete a report (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *         example: 6913e5f33e100b12fe4d9d9f
 *     responses:
 *       200:
 *         description: Report deleted successfully
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
 *                   example: Report deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Report not found
 */

/**
 * @swagger
 * /api/reports/{reportId}/resolve:
 *   patch:
 *     summary: Resolve a report (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *         example: 6913e5f33e100b12fe4d9d9f
 *     responses:
 *       200:
 *         description: Report resolved successfully
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
 *                   example: Report resolved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Report not found
 */