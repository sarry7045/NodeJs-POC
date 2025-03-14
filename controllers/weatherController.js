const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const db = require('../config/database'); // Add database import

const CACHE_FILE = path.join(__dirname, '../cache/weather-cache.json');

async function loadCache() {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

async function saveCache(cache) {
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

exports.getWeather = async (req, res) => {
    const { city } = req.query;
    const userId = req.user.id; // Get user ID from JWT
  
    // Fetch favorite cities if no specific city is provided
    let cities;
    if (city) {
      cities = [city];
    } else {
      try {
        const results = await new Promise((resolve, reject) => {
          db.query('SELECT city FROM user_preferences WHERE user_id = ?', [userId], (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
        });
        cities = results.map(row => row.city);
        if (cities.length === 0) {
          cities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'];
        }
      } catch (err) {
        console.error('Error fetching favorite cities:', err);
      }
    }
  const cache = await loadCache();
  const weatherData = [];

  for (const cityName of cities) {
    const cacheKey = `${cityName}-${Date.now() - 3600000}`; // Cache valid for 1 hour
    if (cache[cityName] && cache[cityName].timestamp > cacheKey) {
      weatherData.push(cache[cityName].data);
      continue;
    }

    try {
      const { data: geo } = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${cityName},India&format=json&limit=1`,
        { headers: { 'User-Agent': 'WeatherApp/1.0' } }
      );
      const lat = geo[0]?.lat;
      const lon = geo[0]?.lon;

      if (!lat || !lon) {
        console.error(`Could not fetch coordinates for ${cityName}`);
        continue;
      }

      const historical = await axios.get(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=2025-02-01&end_date=2025-02-07&hourly=temperature_2m`
      ).catch(err => {
        console.error(`Open-Meteo error for ${cityName}:`, err.response?.data);
        return null;
      });

      if (!historical) continue;

      const wiki = await axios.get(
        `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${cityName}&format=json`
      ).catch(err => {
        console.error(`Wikipedia error for ${cityName}:`, err.response?.data);
        return null;
      });

      if (!wiki) continue;
      const pageId = Object.keys(wiki.data.query.pages)[0];
      const history = wiki.data.query.pages[pageId].extract;

      const cityData = {
        city: cityName,
        latitude: lat,
        longitude: lon,
        historical: historical.data.hourly,
        history,
      };

      cache[cityName] = { data: cityData, timestamp: Date.now() };
      weatherData.push(cityData);
    } catch (err) {
      console.error(`Error processing ${cityName}:`, err);
      continue;
    }
  }

  if (weatherData.length === 0) {
    return res.status(500).send('No data available due to API errors');
  }

  await saveCache(cache);
  res.json(weatherData);
};