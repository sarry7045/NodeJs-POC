const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = 'your_secret_key';

// Middleware
app.use(bodyParser.json());
app.use(cors());

// In-memory user store
// const users = [];

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).send('User registered');
});

// Login endpoint
const users = [
    { username: "harshu", password: "1234" }  // Add this user
];

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ message: "User not found" });
    }

    if (user.password !== password) {
        return res.status(401).json({ message: "Invalid password" });
    }

    res.json({ message: "Login successful" });
});

// Protected endpoint
app.get('/api/protected', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      res.json({ message: 'This is a protected route', user });
    });
  } else {
    res.sendStatus(401);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});