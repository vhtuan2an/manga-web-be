const jwt = require("jsonwebtoken");
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
      return res.status(401).json({ error: "Please Login First" });
    } else {
      try {
        // Giải mã token
        const deCodeToken = await jwt.verify(
          accessToken,
          process.env.ACCESS_TOKEN_SECRET
        );

        req.role = deCodeToken.role;
        req.id = deCodeToken.id;

        // Check if user role is allowed
        if (allowedRoles.length && !allowedRoles.includes(req.role)) {
          return res
            .status(403)
            .json({ error: "Access denied: Insufficient permissions" });
        }

        next();
      } catch (error) {
        if (
          error.name === "JsonWebTokenError" ||
          error.name === "TokenExpiredError"
        ) {
          return res
            .status(401)
            .json({ error: "Invalid or expired token. Please log in again." });
        }
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  };
};

module.exports = {
  authMiddleware,
};