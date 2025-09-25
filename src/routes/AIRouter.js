const AIController = require('../controllers/AIController');
const express = require('express');
const router = express.Router();

// Route to get manga based on user description
router.post('/get-manga', AIController.generateMangaByDescription);

module.exports = router;