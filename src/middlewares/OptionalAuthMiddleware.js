const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

/**
 * Optional Auth Middleware
 * Extracts userId from token if present, but doesn't require authentication.
 * Used for endpoints that work for both logged-in and anonymous users.
 */
const optionalAuthMiddleware = (req, res, next) => {
    let accessToken = req.headers["authorization"];

    if (accessToken && accessToken.startsWith("Bearer ")) {
        accessToken = accessToken.slice(7);
        try {
            const decoded = jwt.verify(
                accessToken,
                process.env.ACCESS_TOKEN_SECRET
            );
            req.id = decoded.id;
            req.role = decoded.role;
        } catch (error) {
            // Token invalid/expired - continue as anonymous user
            req.id = null;
            req.role = null;
        }
    } else {
        req.id = null;
        req.role = null;
    }
    next();
};

module.exports = {
    optionalAuthMiddleware,
};
