const Manga = require("../models/Manga");
const CloudinaryUtils = require("../utils/CloudinaryUtils");
const mongoose = require("mongoose");
const Genre = require("../models/Genre");
const Chapter = require("../models/Chapter");
const Report = require("../models/Report");
const User = require("../models/User");

class MangaService {
  // Helper function to extract public ID from Cloudinary URL to delete images
  extractPublicIdFromUrl(url) {
    const matches = url.match(/\/([^/]+)\.[^.]+$/);
    return matches ? matches[1] : null;
  }

  async createManga(mangaData, coverImageBuffer = null) {
    try {
      let coverImage = "";

      // Upload cover image if provided
      if (coverImageBuffer) {
        const uploadResult = await CloudinaryUtils.uploadImage(
          coverImageBuffer,
          "manga/covers",
          `cover_${Date.now()}`
        );
        coverImage = uploadResult.secure_url;
      }

      const manga = new Manga({
        ...mangaData,
        coverImage: coverImage || mangaData.coverImage || "",
      });

      await manga.save();
      const uploader = await User.findById(manga.uploaderId);
      if (uploader) {
        uploader.uploadedMangas.push(manga._id);
        await uploader.save();
      }
      return {
        status: "success",
        message: "Manga created successfully",
        data: manga,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to create manga: " + error.message,
      };
    }
  }

  async updateManga(mangaId, updateData, coverImageBuffer = null) {
    try {
      const manga = await Manga.findById(mangaId);
      if (!manga) {
        return {
          status: "error",
          message: "Manga not found",
        };
      }

      // Update cover image if provided
      if (coverImageBuffer) {
        if (manga.coverImage) {
          const publicId = this.extractPublicIdFromUrl(manga.coverImage);
          if (publicId) {
            await CloudinaryUtils.deleteImage(publicId);
          }
        }

        const uploadResult = await CloudinaryUtils.uploadImage(
          coverImageBuffer,
          "manga/covers",
          `${mangaId}_cover`
        );
        updateData.coverImage = uploadResult.secure_url;
      }

      // If rawCount is updated, recalculate progress with 2 decimal places
      if (updateData.rawCount !== undefined) {
        const newRawCount = parseInt(updateData.rawCount);
        if (newRawCount > 0) {
          updateData.progress = Math.min(
            Math.round((manga.chapterCount / newRawCount) * 100 * 100) / 100,
            100
          );
        } else {
          updateData.progress = 0;
        }
      }

      const updatedManga = await Manga.findByIdAndUpdate(
        mangaId,
        updateData,
        { new: true }
      ).populate("genres", "name");

      return {
        status: "success",
        data: updatedManga,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to update manga: " + error.message,
      };
    }
  }

  async getMangaList(filter = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        genre,
        status,
        sortBy = "updatedAt:desc",
      } = filter;

      const query = {};

      // Filter by genre
      if (genre) {
        // Assuming genre is passed as genre name or ObjectId
        if (mongoose.Types.ObjectId.isValid(genre)) {
          query.genres = { $in: [new mongoose.Types.ObjectId(genre)] };
        }
      }

      // Filter by status
      if (status) {
        query.status = status;
      }

      // Parse sort parameter
      let sortOptions = {};
      if (sortBy) {
        const [field, order] = sortBy.split(":");
        sortOptions[field] = order === "desc" ? -1 : 1;
      } else {
        sortOptions.updatedAt = -1; // Default sort by updatedAt desc
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Execute query with pagination
      const mangas = await Manga.find(query)
        .populate("genres", "name")
        .populate("uploaderId", "username")
        .skip(skip)
        .limit(limitNum)
        .sort(sortOptions)
        .lean();

      // Get total count for pagination
      const totalItems = await Manga.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limitNum);

      return {
        status: "success",
        data: {
          mangas,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems,
          },
        },
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to retrieve manga list: " + error.message,
      };
    }
  }

  async searchManga(searchParams = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search = "",
        status,
        genres,
        sortBy = "newest",
      } = searchParams;

      const query = {};

      // Search by title or author
      if (search && search.trim() !== "") {
        query.$or = [
          { title: { $regex: search.trim(), $options: "i" } },
          { author: { $regex: search.trim(), $options: "i" } },
        ];
      }

      // Filter by status
      if (status && status.trim() !== "") {
        query.status = status;
      }

      // Filter by genres (support multiple genres)
      if (genres) {
        let genreArray = [];
        
        // Handle different input formats
        if (typeof genres === "string") {
          // If it's a comma-separated string
          genreArray = genres.split(",").map(g => g.trim()).filter(g => g !== "");
        } else if (Array.isArray(genres)) {
          genreArray = genres;
        }

        // Convert to ObjectIds and filter
        const validGenreIds = genreArray
          .filter(id => mongoose.Types.ObjectId.isValid(id))
          .map(id => new mongoose.Types.ObjectId(id));

        if (validGenreIds.length > 0) {
          query.genres = { $in: validGenreIds };
        }
      }

      // Parse sort options
      let sortOptions = {};
      switch (sortBy) {
        case "newest":
          sortOptions.createdAt = -1;
          break;
        case "oldest":
          sortOptions.createdAt = 1;
          break;
        case "mostViewed":
          sortOptions.viewCount = -1;
          break;
        case "highestRating":
          sortOptions.averageRating = -1;
          break;
        case "mostFollowed":
          sortOptions.followedCount = -1;
          break;
        case "az":
          sortOptions.title = 1;
          break;
        case "za":
          sortOptions.title = -1;
          break;
        case "updated":
          sortOptions.updatedAt = -1;
          break;
        default:
          sortOptions.createdAt = -1; // Default to newest
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Execute query with pagination
      const mangas = await Manga.find(query)
        .populate("genres", "name")
        .populate("uploaderId", "username")
        .skip(skip)
        .limit(limitNum)
        .sort(sortOptions)
        .lean();

      // Get total count for pagination
      const totalItems = await Manga.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limitNum);

      return {
        status: "success",
        data: {
          mangas,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems,
            limit: limitNum,
          },
        },
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to search manga: " + error.message,
      };
    }
  }

  async getMangaById(mangaId) {
    try {
      const manga = await Manga.findById(mangaId)
        .populate("genres", "name")
        .populate("uploaderId", "username email")
        .lean();

      if (!manga) {
        return {
          status: "error",
          message: "Manga not found",
        };
      }

      manga.viewCount += 1;
      await Manga.findByIdAndUpdate(mangaId, { viewCount: manga.viewCount });

      return {
        status: "success",
        data: manga,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to retrieve manga details: " + error.message,
      };
    }
  }

  async deleteManga(mangaId) {
    try {
      const manga = await Manga.findById(mangaId);
      if (!manga) {
        return {
          status: "error",
          message: "Manga not found",
        };
      }
      // Delete cover image from Cloudinary if exists
      if (manga.coverImage) {
        const publicId = this.extractPublicIdFromUrl(manga.coverImage);
        if (publicId) {
          await CloudinaryUtils.deleteImage(publicId);
        }
      }
      const uploader = await User.findById(manga.uploaderId);
      if (uploader) {
        uploader.uploadedMangas = uploader.uploadedMangas.filter(
          (id) => id.toString() !== mangaId.toString()
        );
        await uploader.save();
      }
      await Manga.findByIdAndDelete(mangaId);
      return {
        status: "success",
        message: "Manga deleted successfully",
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to delete manga: " + error.message,
      };
    }
  }

  async getChapterList(mangaId) {
    try {
      const chapters = await Chapter.find({ mangaId: mangaId })
        .select("title chapterNumber _id thumbnail pages createdAt updatedAt")
        .sort({ chapterNumber: 1 })
        .lean();
      if (!chapters) {
        return {
          status: "error",
          message: "No chapters found for this manga",
        };
      }
      return {
        status: "success",
        data: chapters,
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to retrieve chapter list: " + error.message,
      };
    }
  }

  async getMangaCountByGenre(genreId) {
    try {
      // Validate genre ID
      if (!mongoose.Types.ObjectId.isValid(genreId)) {
        return {
          status: "error",
          message: "Invalid genre ID",
        };
      }

      // Check if genre exists
      const genre = await Genre.findById(genreId);
      if (!genre) {
        return {
          status: "error",
          message: "Genre not found",
        };
      }

      // Count mangas with this genre
      const count = await Manga.countDocuments({
        genres: { $in: [new mongoose.Types.ObjectId(genreId)] },
      });

      return {
        status: "success",
        data: {
          genreId,
          genreName: genre.name,
          count,
        },
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to count mangas by genre: " + error.message,
      };
    }
  }

  async getRecommendations(mangaId, limit = 10) {
    try {
      // Validate manga ID
      if (!mongoose.Types.ObjectId.isValid(mangaId)) {
        return {
          status: "error",
          message: "Invalid manga ID",
        };
      }

      // Check if manga exists
      const manga = await Manga.findById(mangaId);
      if (!manga) {
        return {
          status: "error",
          message: "Manga not found",
        };
      }

      const limitNum = parseInt(limit);

      // Find users who have this manga in their reading history
      // and get manga they read AFTER this one (collaborative filtering)
      const usersWithManga = await User.find({
        "readingHistory.manga": new mongoose.Types.ObjectId(mangaId),
      }).select("readingHistory");

      // Count frequency of manga read after the target manga
      const mangaFrequency = {};

      for (const user of usersWithManga) {
        // Sort reading history by lastReadAt
        const sortedHistory = [...user.readingHistory].sort(
          (a, b) => new Date(a.lastReadAt) - new Date(b.lastReadAt)
        );

        // Find index of the target manga in this user's history
        const targetIndex = sortedHistory.findIndex(
          (item) => item.manga && item.manga.toString() === mangaId.toString()
        );

        if (targetIndex !== -1 && targetIndex < sortedHistory.length - 1) {
          // Get manga read after the target manga
          for (let i = targetIndex + 1; i < sortedHistory.length; i++) {
            const nextMangaId = sortedHistory[i].manga?.toString();
            if (nextMangaId && nextMangaId !== mangaId.toString()) {
              mangaFrequency[nextMangaId] = (mangaFrequency[nextMangaId] || 0) + 1;
            }
          }
        }
      }

      // Sort by frequency and get top manga IDs
      const sortedMangaIds = Object.entries(mangaFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limitNum)
        .map(([id]) => id);

      let recommendations = [];

      if (sortedMangaIds.length > 0) {
        // Fetch manga details for recommendations
        recommendations = await Manga.find({
          _id: { $in: sortedMangaIds },
        })
          .populate("genres", "name")
          .populate("uploaderId", "username")
          .lean();

        // Sort recommendations by frequency order
        recommendations.sort((a, b) => {
          return (
            sortedMangaIds.indexOf(a._id.toString()) -
            sortedMangaIds.indexOf(b._id.toString())
          );
        });
      }

      // Fallback: if not enough recommendations, add manga with same genres
      if (recommendations.length < limitNum && manga.genres.length > 0) {
        const existingIds = recommendations.map((m) => m._id.toString());
        existingIds.push(mangaId.toString());

        const fallbackMangas = await Manga.find({
          _id: { $nin: existingIds.map((id) => new mongoose.Types.ObjectId(id)) },
          genres: { $in: manga.genres },
        })
          .populate("genres", "name")
          .populate("uploaderId", "username")
          .sort({ averageRating: -1, viewCount: -1 })
          .limit(limitNum - recommendations.length)
          .lean();

        recommendations = [...recommendations, ...fallbackMangas];
      }

      return {
        status: "success",
        data: {
          manga: {
            _id: manga._id,
            title: manga.title,
          },
          recommendations,
          totalRecommendations: recommendations.length,
        },
      };
    } catch (error) {
      return {
        status: "error",
        message: "Failed to get recommendations: " + error.message,
      };
    }
  }
}

module.exports = new MangaService();
