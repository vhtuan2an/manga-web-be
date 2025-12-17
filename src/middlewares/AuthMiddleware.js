const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiErrorUtils");
const dotenv = require("dotenv");
const User = require("../models/User")
dotenv.config();

//Middleware for authentication and role-based access control
const authMiddleware = (allowedRoles = []) => {
  return async (req, res, next) => {
    let accessToken = req.headers['authorization'];
    console.log("Authorization Header:", accessToken);

    if (accessToken && accessToken.startsWith("Bearer ")) {
      accessToken = accessToken.slice(7); // Remove "Bearer " from token
    }

    console.log("Processed Token:", accessToken);

    if (!accessToken) {
      throw new ApiError(401, "Please Login First");
    } else {
      try {
        // Giải mã token
        const deCodeToken = jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET
        );

        req.role = deCodeToken.role;
        req.id = deCodeToken.id;

        // Check if user role is allowed
        if (allowedRoles.length && !allowedRoles.includes(req.role)) {
          throw new ApiError(403, "Access denied: Insufficient permissions");
        }

        next();
      } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
          next(new ApiError(401, "Invalid or expired token. Please log in again."));
        } else if (error instanceof ApiError) {
          next(error);
        } else {
          next(new ApiError(500, "Internal server error"));
        }
      }
    }
  };
};

module.exports = {
  authMiddleware,
};