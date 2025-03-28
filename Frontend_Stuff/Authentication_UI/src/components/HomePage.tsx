import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  MapPin,
  History,
  Navigation,
  Compass,
  Search,
  Loader2,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface WeatherData {
  details?: string;
  history?: string;
  longitude?: string;
  latitude?: string;
}

const HomePage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [city, setCity] = useState("");
  const [selectedService, setSelectedService] = useState("details");
  const [weatherData, setWeatherData] = useState<WeatherData>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "Suraj";
    setUsername(storedUsername);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const services = [
    { id: "details", name: "City Details", icon: MapPin, endpoint: "" },
    { id: "history", name: "History", icon: History, endpoint: "/History" },
    {
      id: "longitude",
      name: "Longitude",
      icon: Navigation,
      endpoint: "/longitude",
    },
    { id: "latitude", name: "Latitude", icon: Compass, endpoint: "/latitude" },
  ];

  const fetchWeatherData = async () => {
    if (!city.trim()) {
      toast.error("Please enter a city name");
      return;
    }

    setIsLoading(true);
    try {
      const service = services.find((s) => s.id === selectedService);
      const endpoint = `http://localhost:3000/api/getDetails/${city}${
        service?.endpoint || ""
      }`;
      const response = await axios.get(endpoint);

      setWeatherData((prev) => ({
        ...prev,
        [selectedService]: response.data,
      }));

      toast.success(
        `Successfully fetched ${service?.name.toLowerCase()} for ${city}`
      );
    } catch (error) {
      toast.error("Failed to fetch weather data");
    } finally {
      setIsLoading(false);
    }
  };

  console.log("weatherData", weatherData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              Weather Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors duration-200"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter city name..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Service
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={`flex items-center justify-center p-3 rounded-lg border ${
                        selectedService === service.id
                          ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                          : "border-gray-200 hover:bg-gray-50"
                      } transition-all duration-200`}
                    >
                      <service.icon className="h-5 w-5 mr-2" />
                      <span>{service.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={fetchWeatherData}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Get Weather Data
                  </>
                )}
              </button>
            </div>

            <div
              className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6"
              style={{ height: "70vh", overflow: "auto" }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Weather Information
              </h3>
              {/* {Object.entries(weatherData).map(([key, value]) => {
                const service = services.find((s) => s.id === key);
                const Icon = service?.icon;
                return (
                  <div
                    key={key}
                    className="bg-white rounded-lg p-4 mb-3 shadow-sm"
                  >
                    <div className="flex items-center mb-2">
                      {Icon && (
                        <Icon className="h-5 w-5 text-indigo-600 mr-2" />
                      )}
                      <h4 className="font-medium text-gray-700 capitalize">
                        {service?.name}
                      </h4>
                    </div>
                    <p className="text-gray-600">{value}</p>
                  </div>
                );
              })} */}
              {Object.entries(weatherData).map(([key, value]) => {
                const service = services.find((s) => s.id === key);
                const Icon = service?.icon;
                const displayValue =
                  typeof value === "object" && value !== null
                    ? JSON.stringify(value, null, 2)
                    : value;
                return (
                  <div
                    key={key}
                    className="bg-white rounded-lg p-4 mb-3 shadow-sm"
                    style={{ height: "40vh", overflow: "auto" }}
                  >
                    <div className="flex items-center mb-2">
                      {Icon && (
                        <Icon className="h-5 w-5 text-indigo-600 mr-2" />
                      )}
                      <h4 className="font-medium text-gray-700 capitalize">
                        {service?.name || key}
                      </h4>
                    </div>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {displayValue}
                    </p>
                  </div>
                );
              })}
              {/* {Object.keys(weatherData).length === 0 && (
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a city and service to view weather information</p>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
