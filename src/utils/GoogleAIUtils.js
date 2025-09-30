const { model } = require('../config/googleAI');
const Genre = require('../models/Genre');
const Manga = require('../models/Manga');

class GoogleAIUtils {
    // Generate manga base on user description
    async generateMangaByDescription(description) {
        try {
            // Step 1: Get suitable genres based on description
            const genres = await Genre.find().lean();
            const genreNames = genres.map(g => g.name).join(', ');

            const genrePrompt = 'Bạn là một người quản lý danh sách các bộ truyện tranh. ' +
                'Dựa trên mô tả sau đây, hãy đề xuất các thể loại phù hợp với mô tả. ' +
                'Mô tả: "' + description + '". ' +
                'Danh sách thể loại truyện tranh hiện có: ' + genreNames + '. ' +
                'Hãy trả lời dưới dạng JSON với format: {"genres": ["Tên thể loại 1", "Tên thể loại 2"]}. ' +
                'Chỉ chọn các thể loại có trong danh sách đã cung cấp.';
            
            const genreResult = await model.generateContent(genrePrompt);
            const genreResponse = await genreResult.response;
            const genreResponseText = genreResponse.text();
            console.log('Genre Response:', genreResponseText);
            
            // Parse genres from AI response
            let suggestedGenres = [];
            try {
                const cleanedResponse = genreResponseText.replace(/```json|```/g, '').trim();
                const parsedResponse = JSON.parse(cleanedResponse);
                suggestedGenres = parsedResponse.genres || [];
            } catch (parseError) {
                console.error('Error parsing genre JSON response:', parseError);
                // Fallback: extract genre names using regex
                const genreMatches = genreResponseText.match(/"([^"]+)"/g);
                if (genreMatches) {
                    suggestedGenres = genreMatches
                        .map(match => match.replace(/"/g, ''))
                        .filter(genre => genreNames.includes(genre));
                }
            }

            if (suggestedGenres.length === 0) {
                return { suggestedGenres: [], recommendedMangas: [] };
            }

            console.log('Suggested Genres:', suggestedGenres);

            // Find genre IDs
            const matchedGenres = await Genre.find({ 
                name: { $in: suggestedGenres } 
            }).select('_id name').lean();
            console.log('Matched Genres from DB:', matchedGenres);
            const genreIds = matchedGenres.map(g => g._id);

            // Find mangas with those genres
            const mangas = await Manga.find({
                genres: { $in: genreIds }
            })
            .select('_id name description genres')
            .populate('genres', 'name')
            .limit(20) // Limit to prevent too much data
            .lean();
            console.log(`Found ${mangas.length} mangas matching genres.`);

            if (mangas.length === 0) {
                return { suggestedGenres, recommendedMangas: [] };
            }

            // Format manga data for AI prompt
            const mangaData = mangas.map(manga => ({
                id: manga._id,
                name: manga.name,
                description: manga.description,
                genres: manga.genres.map(g => g.name).join(', ')
            }));
            console.log('Manga Data for Recommendation:', mangaData);

            // Get AI recommendation based on available mangas
            const recommendationPrompt = `Dựa trên mô tả người dùng: "${description}"

Và danh sách manga hiện có sau đây:
${mangaData.map((manga, index) => 
    `${index + 1}. Tên: ${manga.name}
   Thể loại: ${manga.genres}
   Mô tả: ${manga.description}
   ID: ${manga.id}`
).join('\n\n')}

Hãy chọn 5-8 manga phù hợp nhất với mô tả của người dùng và sắp xếp theo độ phù hợp từ cao đến thấp.
Trả lời dưới dạng JSON với format:
{
  "recommendations": [
    {
      "id": "manga_id",
      "name": "Tên manga",
      "reason": "Lý do gợi ý ngắn gọn (1-2 câu)"
    }
  ]
}`;

            const recommendationResult = await model.generateContent(recommendationPrompt);
            console.log('Recommendation Result:', recommendationResult);
            const recommendationResponse = await recommendationResult.response;
            const recommendationText = recommendationResponse.text();
            console.log('Recommendation Response:', recommendationText);

            // Parse recommendation response
            let recommendedMangas = [];
            try {
                const cleanedRecommendation = recommendationText.replace(/```json|```/g, '').trim();
                const parsedRecommendation = JSON.parse(cleanedRecommendation);
                recommendedMangas = parsedRecommendation.recommendations || [];
            } catch (parseError) {
                console.error('Error parsing recommendation JSON response:', parseError);
                // Fallback: return first few mangas if parsing fails
                recommendedMangas = mangaData.slice(0, 5).map(manga => ({
                    id: manga.id,
                    name: manga.name,
                    reason: "Phù hợp với thể loại bạn quan tâm"
                }));
            }

            return {
                suggestedGenres,
                recommendedMangas
            };

        } catch (error) {
            console.error('Error generating manga by description:', error);
            throw new Error('Failed to generate manga recommendations: ' + error.message);
        }
    }
}

module.exports = new GoogleAIUtils();