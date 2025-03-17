const axios = require("axios");

const getWeather = async (req, res) => {
    try {
        const { city } = req.query;

        if (!city) {
            return res.status(400).json({ error: "City is required" });
        }

        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Missing API key in server config" });
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);

        res.json(response.data);
    } catch (error) {
        console.error("❌ Weather API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
};

module.exports = { getWeather };
