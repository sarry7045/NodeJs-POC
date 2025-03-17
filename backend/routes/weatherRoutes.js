// const express = require("express");
// const axios = require("axios");
// const router = express.Router();

// router.get("/:city", async (req, res) => {
//   try {
//     const city = req.params.city;
//     const API_KEY = process.env.WEATHER_API_KEY;
//     const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

//     const response = await axios.get(url);
//     const data = response.data;

//     res.json({
//       temperature: data.main.temp,
//       humidity: data.main.humidity,
//       windSpeed: data.wind.speed,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching weather data" });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const { getWeather } = require("../controllers/weatherController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Protected Weather API Route
router.get("/", authMiddleware, getWeather);

module.exports = router;
