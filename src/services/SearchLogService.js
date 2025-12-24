const SearchLog = require("../models/SearchLog");
const mongoose = require("mongoose");

class SearchLogService {
    /**
     * Log a search query
     */
    async logSearch(query, resultCount, userId = null, sessionId = null) {
        try {
            const log = new SearchLog({
                query: query.toLowerCase().trim(),
                resultCount,
                userId: userId || null,
                sessionId,
                searchType: "query",
            });
            await log.save();
            return { status: "success", data: log };
        } catch (error) {
            console.error("Failed to log search:", error.message);
            return { status: "error", message: error.message };
        }
    }

    /**
     * Log a click on search result
     */
    async logClick(query, mangaId, position, userId = null, sessionId = null) {
        try {
            const log = new SearchLog({
                query: query.toLowerCase().trim(),
                clickedMangaId: mangaId,
                clickPosition: position,
                userId: userId || null,
                sessionId,
                searchType: "click",
            });
            await log.save();
            return { status: "success", data: log };
        } catch (error) {
            console.error("Failed to log click:", error.message);
            return { status: "error", message: error.message };
        }
    }

    /**
     * Get popular queries for analytics
     */
    async getPopularQueries(limit = 20, days = 30) {
        try {
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - days);

            const results = await SearchLog.aggregate([
                {
                    $match: {
                        searchType: "query",
                        createdAt: { $gte: dateLimit },
                    },
                },
                {
                    $group: {
                        _id: "$query",
                        count: { $sum: 1 },
                        avgResults: { $avg: "$resultCount" },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: limit },
            ]);

            return { status: "success", data: results };
        } catch (error) {
            return { status: "error", message: error.message };
        }
    }

    /**
     * Get click-through data for training (query -> clicked manga pairs)
     */
    async getTrainingData(limit = 10000) {
        try {
            const results = await SearchLog.aggregate([
                { $match: { searchType: "click", clickedMangaId: { $ne: null } } },
                {
                    $group: {
                        _id: { query: "$query", mangaId: "$clickedMangaId" },
                        clicks: { $sum: 1 },
                        avgPosition: { $avg: "$clickPosition" },
                    },
                },
                { $sort: { clicks: -1 } },
                { $limit: limit },
                {
                    $project: {
                        _id: 0,
                        query: "$_id.query",
                        mangaId: "$_id.mangaId",
                        clicks: 1,
                        avgPosition: 1,
                        relevance: {
                            $cond: [
                                { $gte: ["$clicks", 5] }, 3,
                                { $cond: [{ $gte: ["$clicks", 2] }, 2, 1] }
                            ]
                        }
                    },
                },
            ]);

            return { status: "success", data: results };
        } catch (error) {
            return { status: "error", message: error.message };
        }
    }

    /**
     * Export training data as CSV format
     */
    async exportTrainingDataCSV() {
        try {
            const result = await this.getTrainingData();
            if (result.status === "error") return result;

            const csvHeader = "query,manga_id,relevance,clicks\n";
            const csvRows = result.data.map(
                (row) => `"${row.query}",${row.mangaId},${row.relevance},${row.clicks}`
            ).join("\n");

            return {
                status: "success",
                data: csvHeader + csvRows,
                count: result.data.length,
            };
        } catch (error) {
            return { status: "error", message: error.message };
        }
    }
}

module.exports = new SearchLogService();
