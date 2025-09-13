const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

class AuthService {
  async register(userData) {
    try {
      const { username, email, password, confirmPassword, role } = userData;
      if (!email || !password || !confirmPassword || !username || !role) {
        return {
          status: "error",
          message: "All fields are required",
        };
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
            status: "error",
            message: "Invalid email format"
        }
      }
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });
      if (existingUser) {
        return {
          status: "error",
          message: "Username or email already exists"
        };
      }
      if (password !== confirmPassword) {
        return {
          status: "error",
          message: "Passwords do not match"
        };
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        username,
        email,
        password: hashedPassword,
        role
      });
      await user.save();
      return {
        status: "success",
        message: "User registered successfully",
        data: user
      };

    } catch (error) {
      return {
        status: "error",
        message: "Registration failed: " + error.message
      };
    }
  }
}

module.exports = new AuthService();
