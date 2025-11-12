const ReportService = require("../services/ReportService");

class ReportController {
  async reportManga(req, res) {
    try {
      const reportData = {
        userId: req.id,
        mangaId: req.params.mangaId,
        reason: req.body.reason,
      };
      const result = await ReportService.reportManga(reportData);
      if (result.status === "error") {
        return res.status(422).json(result);
      }
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Internal server error: " + error.message,
      });
    }
  }
}

module.exports = new ReportController();
