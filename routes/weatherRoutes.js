const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/weather', authMiddleware, weatherController.getWeather); // Handles GET requests to /api/weather
// Ensures the user is authenticated.
module.exports = router;