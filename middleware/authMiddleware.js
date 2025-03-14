// Protects routes by verifying JWT tokens.
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next(); //Passes control to the next middleware/route handler.
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};