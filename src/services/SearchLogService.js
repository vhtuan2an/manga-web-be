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

            const csvHeader = "query,manga_id,relevance,clicks,source\n";
            const csvRows = result.data.map(
                (row) => `"${row.query}",${row.mangaId},${row.relevance},${row.clicks},${row.source || "direct"}`
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

    /**
     * Get session-linked training data
     * Links zero-result queries to subsequent clicks in the same session
     * 
     * Example: User searches "one pice" (0 results), then "one piece" (5 results), clicks manga X
     * → Infer: "one pice" → manga X (positive pair with lower relevance)
     */
    async getSessionLinkedData(sessionTimeoutMinutes = 5) {
        try {
            const results = await SearchLog.aggregate([
                // Get all clicks
                { $match: { searchType: "click", clickedMangaId: { $ne: null } } },
                
                // Lookup previous queries in same session
                {
                    $lookup: {
                        from: "searchlogs",
                        let: { 
                            clickSession: "$sessionId", 
                            clickTime: "$createdAt",
                            clickUserId: "$userId"
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$searchType", "query"] },
                                            { $eq: ["$resultCount", 0] }, // Zero-result queries only
                                            {
                                                $or: [
                                                    { $eq: ["$sessionId", "$$clickSession"] },
                                                    { $eq: ["$userId", "$$clickUserId"] }
                                                ]
                                            },
                                            // Within timeout window before the click
                                            { $lt: ["$createdAt", "$$clickTime"] },
                                            {
                                                $gt: [
                                                    "$createdAt",
                                                    { $subtract: ["$$clickTime", sessionTimeoutMinutes * 60 * 1000] }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "previousQueries"
                    }
                },
                
                // Unwind to create pairs
                { $unwind: "$previousQueries" },
                
                // Group by query-manga pair
                {
                    $group: {
                        _id: { 
                            query: "$previousQueries.query", 
                            mangaId: "$clickedMangaId" 
                        },
                        inferred: { $sum: 1 },
                    }
                },
                
                // Format output
                {
                    $project: {
                        _id: 0,
                        query: "$_id.query",
                        mangaId: "$_id.mangaId",
                        clicks: "$inferred",
                        relevance: 1, // Lower relevance for inferred pairs
                        source: { $literal: "session_linked" }
                    }
                },
                
                { $sort: { clicks: -1 } },
                { $limit: 5000 }
            ]);

            return { status: "success", data: results };
        } catch (error) {
            return { status: "error", message: error.message };
        }
    }

    /**
     * Get combined training data (direct clicks + session-linked)
     */
    async getFullTrainingData(limit = 10000) {
        try {
            // Get direct click data
            const directData = await this.getTrainingData(limit);
            if (directData.status === "error") return directData;

            // Add source field
            const directResults = directData.data.map(item => ({
                ...item,
                source: "direct"
            }));

            // Get session-linked data
            const linkedData = await this.getSessionLinkedData();
            if (linkedData.status === "error") return linkedData;

            // Combine and deduplicate (prefer direct over inferred)
            const seen = new Set();
            const combined = [];

            // Add direct clicks first (higher priority)
            for (const item of directResults) {
                const key = `${item.query}::${item.mangaId}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    combined.push(item);
                }
            }

            // Add session-linked (lower priority, only if not already present)
            for (const item of linkedData.data) {
                const key = `${item.query}::${item.mangaId}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    combined.push(item);
                }
            }

            return {
                status: "success",
                data: combined.slice(0, limit),
                stats: {
                    directPairs: directResults.length,
                    sessionLinkedPairs: linkedData.data.length,
                    totalUnique: combined.length
                }
            };
        } catch (error) {
            return { status: "error", message: error.message };
        }
    }

    /**
     * Get zero-result queries (for analysis and model evaluation)
     */
    async getZeroResultQueries(limit = 100, days = 30) {
        try {
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - days);

            const results = await SearchLog.aggregate([
                {
                    $match: {
                        searchType: "query",
                        resultCount: 0,
                        createdAt: { $gte: dateLimit }
                    }
                },
                {
                    $group: {
                        _id: "$query",
                        count: { $sum: 1 },
                        lastSearched: { $max: "$createdAt" }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: limit }
            ]);

            return { status: "success", data: results };
        } catch (error) {
            return { status: "error", message: error.message };
        }
    }
}

module.exports = new SearchLogService();

