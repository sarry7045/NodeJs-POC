const WeatherWidget = ({ data }) => {
    return (
      <div className="mt-4 p-4 border rounded">
        <h2 className="text-xl font-bold">Weather Details</h2>
        <p>Temperature: {data.main.temp}°C</p>
        <p>Humidity: {data.main.humidity}%</p>
        <p>longitude: {data.coord.lon}</p>
        <p>latitude: {data.coord.lat}</p>
      </div>
    );
  };
  
  export default WeatherWidget;