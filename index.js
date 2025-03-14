// Entry point of the application
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const app = express(); // Creates an Express application instance.
require('dotenv').config(); // Loads environment variables from .env

const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) { // Checks if the directory exists.
  fs.mkdirSync(cacheDir); // Creates it if it doesn’t, preventing errors when writing cache files.
}

app.use(express.json()); // Parses incoming JSON requests (e.g., login credentials).
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors({ origin: 'http://localhost:3000' })); // Allows frontend requests from different origins
app.set('view engine', 'ejs');

const authRoutes = require('./routes/authRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const crudRoutes = require('./routes/crudRoutes');
const historyRoutes = require('./routes/historyRoutes');
const preferencesRoutes = require('./routes/preferencesRoutes');
const notesRoutes = require('./routes/notesRoutes');

app.use('/api/auth', authRoutes); // Mounts authentication routes
app.use('/api', weatherRoutes); // Mounts other routes
app.use('/api', crudRoutes);
app.use('/api', historyRoutes);
app.use('/api', preferencesRoutes);
app.use('/api', notesRoutes);


// Defines routes to serve static HTML pages.
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/city-history', (req, res) => res.sendFile(path.join(__dirname, 'public', 'city-history.html')));
app.get('/city-weather', (req, res) => res.sendFile(path.join(__dirname, 'public', 'city-weather.html')));
app.get('/favorite-city', (req, res) => res.sendFile(path.join(__dirname, 'public', 'favorite-city.html')));
app.get('/city-notes', (req, res) => res.sendFile(path.join(__dirname, 'public', 'city-notes.html')));

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});