// Selectors
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");

const loadingMessage = document.getElementById("loading");
const errorMessage = document.getElementById("error");

const weatherSection = document.getElementById("weather-section");
const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const weatherIcon = document.getElementById("weather-icon");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");

const API_KEY = "39935ee879cea278a3a5f968eadce457";

// Submit listener
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();
    if (!city) return;

    getWeather(city);
});

// Fetch weather
async function getWeather(city) {
    try {
        showLoading();
        hideError();

        const url =
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=bg`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.cod !== 200) {
            throw new Error("Градът не е намерен.");
        }

        displayWeather(data);

    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Display weather
function displayWeather(data) {
    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;

    const iconCode = data.weather[0].icon;
    weatherIcon.src = "";
    weatherIcon.className = "fa-solid fa-cloud";
    weatherIcon.src = getIconURL(iconCode);

    weatherSection.classList.remove("hidden");
}

// Icon URL
function getIconURL(icon) {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

// Loading / Error
function showLoading() {
    loadingMessage.classList.remove("hidden");
}

function hideLoading() {
    loadingMessage.classList.add("hidden");
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove("hidden");
    weatherSection.classList.add("hidden");
}

function hideError() {
    errorMessage.classList.add("hidden");
}
