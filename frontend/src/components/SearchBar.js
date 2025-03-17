import { useState } from "react";
import axios from "../axiosInstance";

const SearchBar = ({ setWeatherData }) => {
  const [city, setCity] = useState("");

  const fetchWeather = async () => {
    try {
        const token = localStorage.getItem("token"); // 🔹 Get token from storage
        if (!token) {
            console.error("❌ No token found in localStorage!");
            return;
        }

        const res = await axios.get(`/weather?city=${city}`, {  // ✅ Fixed syntax
            headers: {
                Authorization: `Bearer ${token}`, // 🔹 Include token
            },
        });

        setWeatherData(res.data);
    } catch (error) {
        console.error("❌ Error fetching weather data", error.response?.data || error.message);
    }
};


  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Enter city"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="border px-4 py-2"
      />
      <button onClick={fetchWeather} className="bg-blue-500 text-white px-4 py-2 ml-2">
        Search
      </button>
    </div>
  );
};

export default SearchBar;