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
  "/:mangaId",
  authMiddleware(["admin"]),
  ReportController.getReportsInManga
);
router.get(
  "/:reportId",
  authMiddleware(["admin"]),
  ReportController.getReportById
);

module.exports = router;
