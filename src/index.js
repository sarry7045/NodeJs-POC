// import connectDB from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({
  path: "./env",
});

app.get("/api/getDetails/:city", async (req, res) => {
  try {
    const { city } = req.params;
    const response = await axios.get(
      `${process.env.WEATHER_API_URL}?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching weather data" });
  }
});

app.get("/api/getDetails/:city/History", async (req, res) => {
  try {
    const { city } = req.params;
    const response = await axios.get(`${process.env.WIKI_API_URL}${city}`);
    res.json({ title: response.data.title, extract: response.data.extract });
  } catch (error) {
    res.status(500).json({ error: "Error fetching historical data" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

// connectDB()
//   .then(() => {
//     app.listen(process.env.PORT || 8000, () => {
//       console.log(`Server is Running on ${process.env.PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.log("DB Connection Failed", err);
//   });
