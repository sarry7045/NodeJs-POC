import connectDB from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({
  path: "./env",
});

const users = {};

app.post("/api/saveUser", (req, res) => {
  const { userID, userName, name, contact, userEmail, date } = req.body;
  if (!userID) {
    return res.status(400).json({ error: "UserID is required" });
  }
  users[userID] = { userID, userName, name, contact, userEmail, date };
  res.json({ message: "User data saved successfully", data: users[userID] });
});

app.get("/api/getUser/:userID", (req, res) => {
  const { userID } = req.params;
  if (!users[userID]) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(users[userID]);
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

app.get("/api/getDetails/:city/longitude", async (req, res) => {
  try {
    const { city } = req.params;
    const response = await axios.get(
      `${process.env.WEATHER_API_URL}?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );
    res.json({ longitude: response.data.coord.lon });
  } catch (error) {
    res.status(500).json({ error: "Error fetching longitude data" });
  }
});

app.get("/api/getDetails/:city/latitude", async (req, res) => {
  try {
    const { city } = req.params;
    const response = await axios.get(
      `${process.env.WEATHER_API_URL}?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );
    res.json({ latitude: response.data.coord.lat });
  } catch (error) {
    res.status(500).json({ error: "Error fetching latitude data" });
  }
});


// app.listen(process.env.PORT, () => {
//   console.log(`Server is running on http://localhost:${process.env.PORT}`);
// });


connectDB().then(()=>{
  app.listen(process.env.PORT || 3000, ()=>{
      console.log(`Server is Running ${process.env.PORT}`);
  })
}).catch((err) => {
  console.log("Mongo Connection Failed", err);
})

