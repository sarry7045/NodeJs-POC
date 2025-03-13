import React, { useState } from 'react';
import axios from 'axios';
import WeatherSearch from './WeatherSearch';

function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // New state to track login status

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:4000/login', { username, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setMessage('Login successful');
      setIsLoggedIn(true); // Set login status to true after successful login
      setUsername('');
      setPassword('');
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage('An error occurred. Please try again.');
      }
    }
  };

  if (isLoggedIn) {
    return <WeatherSearch />; // Show the WeatherSearch component after login
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;
