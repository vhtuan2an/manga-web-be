const SearchLogService = require("../services/SearchLogService");

class SearchLogController {
    /**
     * Log a click on search result
     * POST /api/search-logs/click
     */
    async logClick(req, res, next) {
        try {
            const { query, mangaId, position } = req.body;
            const userId = req.id || null; // From auth middleware if logged in
            const sessionId = req.headers["x-session-id"] || null;

            if (!query || !mangaId) {
                return res.status(400).json({
                    status: "error",
                    message: "query and mangaId are required",
                });
            }

            const result = await SearchLogService.logClick(
                query,
                mangaId,
                position,
                userId,
                sessionId
            );

            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get popular queries (admin only)
     * GET /api/search-logs/popular
     */
    async getPopularQueries(req, res, next) {
        try {
            const { limit = 20, days = 30 } = req.query;

            const result = await SearchLogService.getPopularQueries(
                parseInt(limit),
                parseInt(days)
            );

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Export training data for ML model (admin only)
     * GET /api/search-logs/training-data
     */
    async getTrainingData(req, res, next) {
        try {
            const result = await SearchLogService.getTrainingData();
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Export training data as CSV (admin only)
     * GET /api/search-logs/training-data/csv
     */
    async exportTrainingDataCSV(req, res, next) {
        try {
            const result = await SearchLogService.exportTrainingDataCSV();

            if (result.status === "error") {
                return res.status(500).json(result);
            }

            res.setHeader("Content-Type", "text/csv");
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=search_training_data.csv"
            );
            res.send(result.data);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SearchLogController();
