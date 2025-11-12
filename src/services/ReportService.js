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

  async getAllReports() {
    try {
      const reports = await Report.find().lean();
      return {
        status: "success",
        data: reports,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to retrieve reports: " + error.message,
      };
    }
  }

  async getReportsInManga(mangaId) {
    try {
      const reports = await Report.find({ mangaId: mangaId }).lean();
      return {
        status: "success",
        data: reports,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to retrieve reports: " + error.message,
      };
    }
  }

  async getReportsById (reportId) {
    try {
        const report = await Report.findById(reportId).lean();
        if (!report) {
            return {
                status: "error",
                message: "Report not found",
            };
        }
        return {
            status: "success",
            data: report,
        };
    } catch (error) {
        return {
            status: "error",
            message: "Failed to retrieve report: " + error.message,
        };
    }
  }
}

module.exports = new ReportService();
