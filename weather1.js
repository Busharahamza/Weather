// Integration with API
// Current weather:
https://api.openweathermap.org/data/2.5/weather?q={CITY}&units=metric&appid=API_KEY

// 5-day forecast:
https://api.openweathermap.org/data/2.5/forecast?q={CITY}&units=metric&appid=API_KEY
const API_KEY = "YOUR_API_KEY";

// Search weather by city
async function getWeatherByCity(city) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
  );

  if (!res.ok) {
    showError("City not found. Please try again.");
    return;
  }

  const data = await res.json();
  displayCurrentWeather(data);
  saveRecentCity(city);
}


// Search weather by current location
navigator.geolocation.getCurrentPosition(success => {
    const { latitude, longitude } = success.coords;
    getWeatherByCoords(latitude, longitude);
}, () => {
    showError("Location access denied.");
});


// Dropdown - recently searched cities
function saveRecentCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  if (!cities.includes(city)) {
    cities.unshift(city);
    if (cities.length > 5) cities.pop();
  }

  localStorage.setItem("recentCities", JSON.stringify(cities));
  updateDropdown();
}

function updateDropdown() {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  const dropdown = document.getElementById("recentDropdown");
  dropdown.innerHTML = "";

  cities.forEach(city => {
    const item = document.createElement("button");
    item.textContent = city;
    item.onclick = () => getWeatherByCity(city);
    dropdown.appendChild(item);
  });
}


// Event Listeners
document.getElementById("searchBtn").addEventListener("click", () => {
  const city = document.getElementById("searchInput").value.trim();
  if (!city) return showError("Please enter a city name.");
  getWeatherByCity(city);
});

// Input Validation
if (city === "") {
   showError("Search field cannot be empty.");
   return;
}

// Display weather
function displayCurrentWeather(data) {
  document.getElementById("temp").textContent = data.main.temp + "°C";
  document.getElementById("humidity").textContent = data.main.humidity + "%";
  document.getElementById("wind").textContent = data.wind.speed + " m/s";
}

// Temperature Toggle
let isCelsius = true;

function toggleTemp() {
  let temp = parseFloat(document.getElementById("temp").textContent);

  if (isCelsius) {
    temp = (temp * 9/5) + 32;
    document.getElementById("temp").textContent = temp.toFixed(1) + "°F";
  } else {
    temp = (temp - 32) * 5/9;
    document.getElementById("temp").textContent = temp.toFixed(1) + "°C";
  }

  isCelsius = !isCelsius;
}


// Extreme Temperature Alert
if (data.main.temp > 40) {
  showAlert("Extreme heat! Stay hydrated.");
}

// Weather icon
const weather = data.weather[0].main.toLowerCase();

if (weather.includes("rain")) {
  document.body.classList.add("rainy-bg");
}


// 5day forecast
async function getForecast(city) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
  );
  const data = await res.json();
  displayForecast(data);
}

// Each day as card
function displayForecast(data) {
  const container = document.getElementById("forecast");
  container.innerHTML = "";

  const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));

  daily.forEach(day => {
    const card = document.createElement("div");
    card.className = "p-4 bg-white rounded shadow text-center";

    card.innerHTML = `
      <h3>${day.dt_txt.split(" ")[0]}</h3>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
      <p>${day.main.temp}°C</p>
      <p>Wind: ${day.wind.speed} m/s</p>
      <p>Humidity: ${day.main.humidity}%</p>
    `;

    container.appendChild(card);
  });
}

// Handle Errors
function showError(msg) {
  const box = document.getElementById("errorBox");
  box.textContent = msg;
  box.classList.remove("hidden");

  setTimeout(() => box.classList.add("hidden"), 3000);
}
