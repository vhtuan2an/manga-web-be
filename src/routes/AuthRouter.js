const AuthController = require('../controllers/AuthController');
const express = require('express');
const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

module.exports = router;
