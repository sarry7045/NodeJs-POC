const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
    try {

        // Get token from Authorization header
        const token = req.header("Authorization");

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        // Remove "Bearer " prefix if present
        const jwtToken = token.replace("Bearer ", "").trim();

        // Verify token
        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
        req.user = decoded; // Store decoded token data in `req.user`

        next(); // Call next middleware or route handler
    } catch (error) {
        console.error("❌ Authentication Error:", error.message);
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;
