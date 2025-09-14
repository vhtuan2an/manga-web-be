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

  async login(email, password) {
    try {
      if (!email || !password) {
        return {
          status: "error",
          message: "All fields are required"
        };
      }
      const user = await User.findOne({ email });
      if (!user) {
        return {
          status: "error",
          message: "User not found"
        };
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return {
          status: "error",
          message: "Invalid credentials"
        };
      }
      const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d"
      });
      return {
        status: "success",
        message: "Login successful",
        data: {
          user,
          accessToken
        }
      };
    } catch (error) {
      return {
        status: "error",
        message: "Login failed: " + error.message
      };
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return {
          status: "error",
          message: "User not found"
        };
      }
      return {
        status: "success",
        data: user
      };
    } catch (error) {
      return {
        status: "error",
        message: "Error fetching user: " + error.message
      };
    }
  }
}

module.exports = new AuthService();
