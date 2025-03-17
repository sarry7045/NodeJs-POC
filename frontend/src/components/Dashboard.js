import { useState } from "react";
import SearchBar from "./SearchBar";
import WeatherWidget from "./WeatherWidget";

const Dashboard = () => {
  const [weatherData, setWeatherData] = useState(null);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Weather Dashboard</h1>
      <SearchBar setWeatherData={setWeatherData} />
      {weatherData && <WeatherWidget data={weatherData} />}
    </div>
  );
};

export default Dashboard;