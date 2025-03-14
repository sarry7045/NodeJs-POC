const axios = require('axios');

exports.getCityHistory = async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).send('City name is required');
  }

  try {
    // Fetching historical background from Wikipedia
    const wiki = await axios.get(
      `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(city)}&format=json`
    );

    const pageId = Object.keys(wiki.data.query.pages)[0];
    if (pageId === '-1') {
      return res.status(404).send(`No history found for ${city}`);
    }

    const history = wiki.data.query.pages[pageId].extract;
    res.json({
      city,
      history,
    });
  } catch (err) {
    console.error(`Wikipedia error for ${city}:`, err.response?.data || err.message);
    res.status(500).send('Error fetching city history');
  }
};