const Manga = require("../models/Manga");
const Report = require("../models/Report");

class ReportService {
  async reportManga(reportData) {
    try {
      const manga = await Manga.findById(reportData.mangaId);
      if (!manga) {
        return {
          status: "error",
          message: "Manga not found",
        };
      }

      const report = new Report(reportData);

      await report.save();

      return {
        status: "success",
        message: "Manga reported successfully",
        data: report,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to report manga: " + error.message,
      };
    }
  }
}

module.exports = new ReportService();
