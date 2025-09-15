const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

router.post('/:id/follow', UserController.followManga);
router.post('/:id/unfollow', UserController.unfollowManga);

router.get('/:id/reading-history', UserController.getReadingHistory);
router.post('/:id/reading-history', UserController.updateReadingHistory);

router.get('/:id/uploaded-mangas', UserController.getUploadedMangas);

module.exports = router;
