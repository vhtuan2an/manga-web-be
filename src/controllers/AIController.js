const AIService = require('../services/AIService');

class AIController {
    // Generate manga based on user description
    async generateMangaByDescription(req, res) {
        try {
            const { description } = req.body;
            if (!description) {
                return res.status(400).json({ message: 'Description is required' });
            }
            const result = await AIService.generateMangaByDescription(description);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: 'Failed to generate manga: ' + error.message });
        }
    }
}

module.exports = new AIController();
