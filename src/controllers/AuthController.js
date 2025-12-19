const AuthService = require('../services/AuthService');
const UserService = require('../services/UserService');

class AuthController {
    async register(req, res, next) {
        try {
            const userData = req.body;
            const result = await AuthService.register(userData);
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await AuthService.login(email, password);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getUserInfo(req, res, next) {
        try {
            const userId = req.id;
            const result = await UserService.getUserById(userId);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await AuthService.forgotPassword(email);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async verifyOTP(req, res, next) {
        try {
            const { email, otp } = req.body;
            const result = await AuthService.verifyOTP(email, otp);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { email, otp, newPassword, confirmPassword } = req.body;
            const result = await AuthService.resetPassword(email, otp, newPassword, confirmPassword);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();