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

module.exports = router;
