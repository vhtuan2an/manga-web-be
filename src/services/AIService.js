const GoogleAIUtils = require('../utils/GoogleAIUtils');

class AIService {
    // Generate manga based on user description
    async generateMangaByDescription(description) {
        try {
            const result = await GoogleAIUtils.generateMangaByDescription(description);
            return result;
        } catch (error) {
            throw new Error('Failed to generate manga: ' + error.message);
        }
    }
}

module.exports = new AIService();
