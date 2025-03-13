// import connectDB from "./db/index.js";
import { app } from "./app.js";
import dotenv from "dotenv";
import axios from "axios";
import express from 'express'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors'

const router = express.Router();

dotenv.config({
  path: "./.env",
});

// In-memory user store (for demo purposes)
const users = [];

// JWT secret for signing tokens
const JWT_SECRET = 'your_jwt_secret';

// In-memory store for image URLs
let imageUrls = [];

let cards = [];

app.use(express.json());

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
    const response = await axios.get(`${process.env.WIKIPEDIA_HISTORY}${city}`);
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

// Register route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Check if user already exists
  const userExists = users.find(user => user.username === username);
  if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Store the new user in memory
  users.push({ username, password: hashedPassword });

  res.status(201).json({ message: 'User registered successfully' });
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Find the user in the in-memory store
  const user = users.find(user => user.username === username);
  if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
  }

  // Compare the password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid username or password' });
  }

  // Create a JWT token
  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });

  res.json({ message: 'Login successful', token });
});

// Protected route
app.get('/protected', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
      return res.status(401).json({ message: 'Access denied' });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
          return res.status(403).json({ message: 'Invalid token' });
      }
      res.json({ message: `Hello ${user.username}, this is a protected route!` });
  });
});

// Route to get all image URLs with index
app.get('/images', (req, res) => {
  const imagesWithIndex = imageUrls.map((url, index) => ({
    index,
    url,
  }));
  res.json(imagesWithIndex);
});

// Route to add a new image URL
app.post('/images', (req, res) => {
  const { url } = req.body;
  if (url) {
    imageUrls.push(url);
    const newImage = { index: imageUrls.length - 1, url };
    res.status(201).json({ message: 'Image URL added successfully', newImage });
  } else {
    res.status(400).json({ message: 'URL is required' });
  }
});

// Route to delete an image URL by index
app.delete('/images/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (index >= 0 && index < imageUrls.length) {
    imageUrls.splice(index, 1);
    const imagesWithIndex = imageUrls.map((url, index) => ({
      index,
      url,
    }));
    res.json({ message: 'Image URL deleted successfully', images: imagesWithIndex });
  } else {
    res.status(404).json({ message: 'Image URL not found' });
  }
});

// Route to add card data
app.post("/api/addCard", (req, res) => {
  const { image, name, description } = req.body;

  // Validation: Ensure all required fields are present
  if (!image || !name || !description) {
    return res.status(400).json({ error: "All fields (image, name, description) are required." });
  }

  // Create new card object
  const newCard = {
    id: cards.length + 1,  // Auto-increment ID
    image,
    name,
    description,
  };

  // Add the new card to the cards array
  cards.push(newCard);

  res.json({ message: "Card added successfully", data: newCard });
});

// Route to get all cards
app.get("/api/getCards", (req, res) => {
  res.json(cards);
});

// Route to get a specific card by ID
app.get("/api/getCard/:id", (req, res) => {
  const { id } = req.params;
  const card = cards.find((c) => c.id === parseInt(id));

  if (!card) {
    return res.status(404).json({ error: "Card not found" });
  }

  res.json(card);
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
