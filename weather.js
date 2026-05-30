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
    weatherIcon.src = getIconURL(iconCode);
    updateBackground(data.weather[0].id);
    updateEmoji(data.weather[0].id);

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

function updateBackground(conditionId) {
    document.body.className = "";

    if (conditionId >= 200 && conditionId <= 232) {
        document.body.classList.add("stormy");
    }
    else if (conditionId >= 300 && conditionId <= 321) {
        document.body.classList.add("rainy");
    }
    else if (conditionId >= 500 && conditionId <= 531) {
        document.body.classList.add("rainy");
    }
    else if (conditionId >= 600 && conditionId <= 622) {
        document.body.classList.add("snowy");
    }
    else if (conditionId >= 701 && conditionId <= 781) {
        document.body.classList.add("foggy");
    }
    else if (conditionId === 800) {
        document.body.classList.add("sunny");
    }
    else if (conditionId >= 801 && conditionId <= 804) {
        document.body.classList.add("cloudy");
    }
    else {
        document.body.classList.add("night");
    }
}



