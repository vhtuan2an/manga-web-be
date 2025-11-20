const User = require('../models/User');
const Manga = require('../models/Manga');
const Report = require('../models/Report');

class StatisticsService {
    async getStatistics() {
        try {
            // Run all queries in parallel for better performance
            const [
                totalUsers,
                totalMangas,
                totalUploaders,
                totalReports,
                totalReaders,
                totalAdmins
            ] = await Promise.all([
                User.countDocuments(),
                Manga.countDocuments(),
                User.countDocuments({ role: 'uploader' }),
                Report.countDocuments(),
                User.countDocuments({ role: 'reader' }),
                User.countDocuments({ role: 'admin' })
            ]);

            return {
                status: 'success',
                data: {
                    users: {
                        total: totalUsers,
                        uploaders: totalUploaders,
                        readers: totalReaders,
                        admins: totalAdmins
                    },
                    mangas: {
                        total: totalMangas
                    },
                    reports: {
                        total: totalReports
                    }
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async getDetailedStatistics() {
        try {
            const [
                totalUsers,
                totalMangas,
                totalUploaders,
                totalReports,
                ongoingMangas,
                completedMangas,
                hiatusMangas,
                pendingReports,
                resolvedReports
            ] = await Promise.all([
                User.countDocuments(),
                Manga.countDocuments(),
                User.countDocuments({ role: 'uploader' }),
                Report.countDocuments(),
                Manga.countDocuments({ status: 'ongoing' }),
                Manga.countDocuments({ status: 'completed' }),
                Manga.countDocuments({ status: 'hiatus' }),
                Report.countDocuments({ status: 'pending' }),
                Report.countDocuments({ status: 'resolved' })
            ]);

            return {
                status: 'success',
                data: {
                    users: {
                        total: totalUsers,
                        uploaders: totalUploaders,
                        readers: await User.countDocuments({ role: 'reader' }),
                        admins: await User.countDocuments({ role: 'admin' })
                    },
                    mangas: {
                        total: totalMangas,
                        ongoing: ongoingMangas,
                        completed: completedMangas,
                        hiatus: hiatusMangas
                    },
                    reports: {
                        total: totalReports,
                        pending: pendingReports,
                        resolved: resolvedReports
                    }
                }
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new StatisticsService();