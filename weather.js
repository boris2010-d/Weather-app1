const DOM = {
    searchForm: document.getElementById("search-form"),
    cityInput: document.getElementById("city-input"),

    loading: document.getElementById("loading"),
    error: document.getElementById("error"),

    weatherSection: document.getElementById("weather-section"),
    cityName: document.getElementById("city-name"),
    temperature: document.getElementById("temperature"),
    description: document.getElementById("description"),
    weatherIcon: document.getElementById("weather-icon"),
    humidity: document.getElementById("humidity"),
    windSpeed: document.getElementById("wind-speed"),

    moodEmoji: document.getElementById("mood-emoji")
};


// API ключ за OpenWeatherMap
const API_KEY = "39935ee879cea278a3a5f968eadce457";



// СЪБМИТ НА ФОРМАТА

searchForm.addEventListener("submit", (event) => {
    event.preventDefault(); // спира презареждането на страницата

    const city = cityInput.value.trim(); // взимаме въведения град
    if (!city) return; // ако е празно спираме

    getWeather(city); // извикваме функцията за времето
});



// ВЗИМАНЕ НА ВРЕМЕТО ОТ API
async function getWeather(city) {
    try {
        showLoading();  // показваме "зареждане"
        hideError();    // скриваме грешките

        // URL към OpenWeatherMap API
        const url =
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=bg`;

        const response = await fetch(url); // изпращаме заявка
        const data = await response.json(); // получаваме JSON

        if (data.cod !== 200) {
            throw new Error("Градът не е намерен.");
        }

        displayWeather(data); // показваме времето

    } catch (error) {
        showError(error.message); // показваме грешка
    } finally {
        hideLoading(); // винаги скриваме "зареждане"
    }
}


// ПОКАЗВАНЕ НА ВРЕМЕТО
function displayWeather(data) {
    // Основна информация
    cityName.textContent = data.name;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;

    // Икона от OpenWeather
    const iconCode = data.weather[0].icon;
    weatherIcon.src = getIconURL(iconCode);

    // Динамичен фон + mood emoji
    updateBackground(data.weather[0].id);
    updateEmoji(data.weather[0].id);

    weatherSection.classList.remove("hidden"); // показваме секцията
}



// ВЗИМАНЕ НА URL ЗА ИКОНАТА
function getIconURL(icon) {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}



// СЪОБЩЕНИЯ ЗА ЗАРЕЖДАНЕ / ГРЕШКА
function showLoading() {
    loadingMessage.classList.remove("hidden");
}

function hideLoading() {
    loadingMessage.classList.add("hidden");
}

function showError(msg) {
    // Показваме текста на грешката
    errorMessage.textContent = msg;
    errorMessage.classList.remove("hidden");

    // Скриваме секцията с времето
    weatherSection.classList.add("hidden");

    // Изчистваме старите данни
    cityName.textContent = "";
    temperature.textContent = "";
    description.textContent = "";
    humidity.textContent = "";
    windSpeed.textContent = "";

    // Нулираме иконата
    weatherIcon.src = "";
    weatherIcon.className = "fa-solid fa-cloud"; // fallback икона

    // Нулираме mood emoji
    document.getElementById("mood-emoji").textContent = "🙂";
}


function hideError() {
    errorMessage.classList.add("hidden");
}



// ДИНАМИЧЕН ФОН СПОРЕД ВРЕМЕТО
function updateBackground(conditionId) {
    document.body.className = ""; // махаме стария фон

    // Проверяваме по weather ID
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



// MOOD EMOJI СПОРЕД ВРЕМЕТО
function updateEmoji(conditionId) {
    const emoji = document.getElementById("mood-emoji");

    // Избираме емоджи според weather ID
    if (conditionId >= 200 && conditionId <= 232) emoji.textContent = "⛈️";
    else if (conditionId >= 300 && conditionId <= 321) emoji.textContent = "🌦️";
    else if (conditionId >= 500 && conditionId <= 531) emoji.textContent = "🌧️";
    else if (conditionId >= 600 && conditionId <= 622) emoji.textContent = "❄️";
    else if (conditionId >= 701 && conditionId <= 781) emoji.textContent = "🌫️";
    else if (conditionId === 800) emoji.textContent = "😎";
    else if (conditionId >= 801 && conditionId <= 804) emoji.textContent = "☁️";
    else emoji.textContent = "🌍"; // fallback
}


