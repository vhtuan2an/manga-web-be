const AuthController = require('../controllers/AuthController');
const express = require('express');
const { authMiddleware } = require('../middlewares/AuthMiddleware');
const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/user', authMiddleware(['uploader', 'reader']), AuthController.getUserInfo);

module.exports = router;
