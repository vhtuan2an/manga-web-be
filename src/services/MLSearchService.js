/**
 * ML Search Service
 * Calls Python FastAPI semantic search service
 */

const ML_SEARCH_URL = process.env.ML_SEARCH_URL;
const ML_SEARCH_TIMEOUT = parseInt(process.env.ML_SEARCH_TIMEOUT)
const ML_SEARCH_ENABLED = process.env.ML_SEARCH_ENABLED !== "false";

class MLSearchService {
  /**
   * Check if ML search service is available
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ML_SEARCH_TIMEOUT);

      const response = await fetch(`${ML_SEARCH_URL}/health`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      return data.model_loaded && data.embeddings_loaded;
    } catch (error) {
      console.log("[MLSearch] Service not available:", error.message);
      return false;
    }
  }

  /**
   * Search for manga using ML semantic search
   * @param {string} query - Search query
   * @param {number} limit - Max results to return
   * @returns {Promise<{success: boolean, mangaIds: string[], scores: Object}>}
   */
  async search(query, limit = 50) {
    // Check if ML search is enabled
    if (!ML_SEARCH_ENABLED) {
      console.log("[MLSearch] Disabled via ML_SEARCH_ENABLED env var");
      return {
        success: false,
        mangaIds: [],
        scores: {},
        total: 0,
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ML_SEARCH_TIMEOUT);

      const url = new URL(`${ML_SEARCH_URL}/search`);
      url.searchParams.append("query", query);
      url.searchParams.append("limit", limit.toString());

      const response = await fetch(url.toString(), {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`ML API returned ${response.status}`);
      }

      const data = await response.json();

      // Extract manga IDs and scores from results
      const mangaIds = data.results.map((r) => r.manga_id);
      const scores = {};
      data.results.forEach((r) => {
        scores[r.manga_id] = r.score;
      });

      console.log(`[MLSearch] Found ${mangaIds.length} results for "${query}"`);

      return {
        success: true,
        mangaIds,
        scores,
        total: data.total,
      };
    } catch (error) {
      console.log("[MLSearch] Search failed:", error.message);
      return {
        success: false,
        mangaIds: [],
        scores: {},
        total: 0,
      };
    }
  }

  /**
   * Reload ML model (after retraining)
   * @returns {Promise<boolean>}
   */
  async reloadModel() {
    try {
      const response = await fetch(`${ML_SEARCH_URL}/reload`, {
        method: "POST",
      });
      const data = await response.json();
      return data.status === "success";
    } catch (error) {
      console.log("[MLSearch] Reload failed:", error.message);
      return false;
    }
  }
}

module.exports = new MLSearchService();
