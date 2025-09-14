const AuthService = require('../services/AuthService');

class AuthController {
    async register(req, res) {
        const userData = req.body;
        const result = await AuthService.register(userData);

        if (result.status === 'error') {
            return res.status(422).json(result);
        }
        return res.status(201).json(result);
    }

    async login(req, res) {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        if (result.status === 'error') {
            return res.status(422).json(result);
        }
        return res.status(200).json(result);
    }

    async getUserInfo(req, res) {
        const userId = req.id;
        const result = await AuthService.getUserById(userId);
        if (result.status === 'error') {
            return res.status(404).json(result);
        }
        return res.status(200).json(result);
    }
}

module.exports = new AuthController();