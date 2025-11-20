const StatisticsService = require('../services/StatisticsService');

class StatisticsController {
    async getStatistics(req, res) {
        try {
            const result = await StatisticsService.getStatistics();
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error: ' + error.message
            });
        }
    }

    async getDetailedStatistics(req, res) {
        try {
            const result = await StatisticsService.getDetailedStatistics();
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error: ' + error.message
            });
        }
    }
}

module.exports = new StatisticsController();