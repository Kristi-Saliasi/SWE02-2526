// Using Open-Meteo (free, no API key needed) + Geocoding API
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherCard = document.getElementById("weatherCard");
const errorDiv = document.getElementById("error");
const loading = document.getElementById("loading");

searchBtn.addEventListener("click", getWeather);
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") getWeather();
});

async function getWeather() {
  const city = cityInput.value.trim();
  if (!city) return;

  weatherCard.classList.add("hidden");
  errorDiv.classList.add("hidden");
  loading.classList.remove("hidden");

  try {
    // Step 1: Get coordinates from city name
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Try again.");
    }

    const { latitude, longitude, name, country_code } = geoData.results[0];

    // Step 2: Get weather using coordinates
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&wind_speed_unit=ms`
    );
    const weatherData = await weatherRes.json();

    loading.classList.add("hidden");
    displayWeather(weatherData.current, name, country_code);

  } catch (err) {
    loading.classList.add("hidden");
    errorDiv.textContent = err.message || "Something went wrong. Try again.";
    errorDiv.classList.remove("hidden");
    console.error(err);
  }
}

function getWeatherDescription(code) {
  const codes = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Icy fog", 51: "Light drizzle", 53: "Drizzle",
    55: "Heavy drizzle", 61: "Slight rain", 63: "Rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Snow", 75: "Heavy snow", 80: "Rain showers",
    81: "Rain showers", 82: "Heavy rain showers", 95: "Thunderstorm",
  };
  return codes[code] || "Unknown";
}

function getWeatherIcon(code) {
  if (code === 0 || code === 1) return "☀️";
  if (code === 2 || code === 3) return "⛅";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 95) return "⛈️";
  return "🌤️";
}

function displayWeather(current, cityName, country) {
  document.getElementById("cityName").textContent = `${cityName}, ${country}`;
  document.getElementById("temp").textContent = `${Math.round(current.temperature_2m)}°C`;
  document.getElementById("description").textContent = getWeatherDescription(current.weather_code);
  document.getElementById("feelsLike").textContent = `${Math.round(current.apparent_temperature)}°C`;
  document.getElementById("humidity").textContent = `${current.relative_humidity_2m}%`;
  document.getElementById("wind").textContent = `${current.wind_speed_10m} m/s`;
  document.getElementById("weatherIcon").textContent = getWeatherIcon(current.weather_code);

  weatherCard.classList.remove("hidden");
}