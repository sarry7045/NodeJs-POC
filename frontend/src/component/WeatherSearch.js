import React, { useState } from 'react';
import axios from 'axios';

function WeatherSearch() {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState(null);
    const [history, setHistory] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [latitude, setLatitude] = useState(null);
    const [error, setError] = useState('');
  
    const handleSearch = async (e) => {
      e.preventDefault();
      setError(''); // Reset error
  
      try {
        // Fetch weather data
        const weatherResponse = await axios.get(`http://localhost:4000/api/getDetails/${city}`);
        setWeather(weatherResponse.data);
  
        // Fetch historical data
        const historyResponse = await axios.get(`http://localhost:4000/api/getDetails/${city}/History`);
        setHistory(historyResponse.data);
  
        // Fetch longitude
        const longitudeResponse = await axios.get(`http://localhost:4000/api/getDetails/${city}/longitude`);
        setLongitude(longitudeResponse.data.longitude);
  
        // Fetch latitude
        const latitudeResponse = await axios.get(`http://localhost:4000/api/getDetails/${city}/latitude`);
        setLatitude(latitudeResponse.data.latitude);
        setCity('');
      } catch (err) {
        setError('Error fetching data. Please check if the city name is correct.');
      }
    };
  
    return (
      <div>
        <h1>City Information Search</h1>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
            required
          />
          <button type="submit">Search</button>
        </form>
  
        {error && <p style={{ color: 'red' }}>{error}</p>}
  
        {weather && (
          <div>
            <h2>Weather Data</h2>
            <p><strong>Temperature:</strong> {weather.main.temp}°C</p>
            <p><strong>Weather:</strong> {weather.weather[0].description}</p>
          </div>
        )}
  
        {history && (
          <div>
            <h2>Historical Data</h2>
            <p><strong>Title:</strong> {history.title}</p>
            <p><strong>Extract:</strong> {history.extract}</p>
          </div>
        )}
  
        {longitude && (
          <div>
            <h2>Geographical Data</h2>
            <p><strong>Longitude:</strong> {longitude}</p>
          </div>
        )}
  
        {latitude && (
          <div>
            <p><strong>Latitude:</strong> {latitude}</p>
          </div>
        )}
      </div>
    );
  }
export default WeatherSearch;
