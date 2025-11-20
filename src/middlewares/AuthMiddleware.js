const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User")
dotenv.config();

// Middleware for authentication and role-based access control
const authMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
              status: 'error',
              message: 'No token provided'
          });
      }

      const token = authHeader.split(' ')[1];

      // Verify token using ACCESS_TOKEN_SECRET
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      
      // Check if user role is allowed
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
          return res.status(403).json({
              status: 'error',
              message: 'Access forbidden: insufficient permissions'
          });
      }

      // Attach user info to request
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({
              status: 'error',
              message: 'Invalid token'
          });
      }
      
      if (error.name === 'TokenExpiredError') {
          return res.status(401).json({
              status: 'error',
              message: 'Token expired'
          });
      }

      return res.status(500).json({
          status: 'error',
          message: 'Internal server error'
      });
    }
  };
};

module.exports = {
  authMiddleware,
};
