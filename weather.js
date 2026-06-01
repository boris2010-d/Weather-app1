const DOM = { // обект, който държи всички DOM елементи
    searchForm: document.getElementById("search-form"), // взимаме формата
    cityInput: document.getElementById("city-input"), // взимаме input полето

    loading: document.getElementById("loading"), // елемент за "зареждане"
    error: document.getElementById("error"), // елемент за грешки

    weatherSection: document.getElementById("weather-section"), // секцията с времето
    cityName: document.getElementById("city-name"), // име на града
    temperature: document.getElementById("temperature"), // температура
    description: document.getElementById("description"), // описание на времето
    weatherIcon: document.getElementById("weather-icon"), // иконата за времето
    humidity: document.getElementById("humidity"), // влажност
    windSpeed: document.getElementById("wind-speed"), // скорост на вятъра

    moodEmoji: document.getElementById("mood-emoji") // mood emoji
};


// API ключ за OpenWeatherMap
const API_KEY = "39935ee879cea278a3a5f968eadce457"; // ключ за API-то



// СЪБМИТ НА ФОРМАТА

DOM.searchForm.addEventListener("submit", (event) => { // слушаме за submit
    event.preventDefault(); // спираме презареждането на страницата

    const city = DOM.cityInput.value.trim(); // взимаме въведения град
    if (!city) return; // ако е празно — спираме

    getWeather(city); // извикваме функцията за времето
});



// ВЗИМАНЕ НА ВРЕМЕТО ОТ API
async function getWeather(city) { // асинхронна функция за fetch
    try {
        showLoading();  // показваме "зареждане"
        hideError();    // скриваме грешките

        // URL към OpenWeatherMap API
        const url =
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=bg`; // сглобяваме URL

        const response = await fetch(url); // изпращаме заявка
        const data = await response.json(); // получаваме JSON

        if (data.cod !== 200) { // ако API върне грешка
            throw new Error("Градът не е намерен."); // хвърляме грешка
        }

        displayWeather(data); // показваме времето

    } catch (error) {
        showError(error.message); // показваме грешка
    } finally {
        hideLoading(); // винаги скриваме "зареждане"
    }
}


// ПОКАЗВАНЕ НА ВРЕМЕТО
function displayWeather(data) { // функция за визуализиране
    // Основна информация
    DOM.cityName.textContent = data.name; // име на града
    DOM.temperature.textContent = `${Math.round(data.main.temp)}°C`; // температура
    DOM.description.textContent = data.weather[0].description; // описание
    DOM.humidity.textContent = `${data.main.humidity}%`; // влажност
    DOM.windSpeed.textContent = `${data.wind.speed} m/s`; // вятър

    // Икона от OpenWeather
    const iconCode = data.weather[0].icon; // код на иконата
    DOM.weatherIcon.src = getIconURL(iconCode); // задаваме URL на иконата

    // Динамичен фон + mood emoji
    updateBackground(data.weather[0].id); // сменяме фона
    updateEmoji(data.weather[0].id); // сменяме емоджито

    DOM.weatherSection.classList.remove("hidden"); // показваме секцията
}



// ВЗИМАНЕ НА URL ЗА ИКОНАТА
function getIconURL(icon) { // функция за URL на иконата
    return `https://openweathermap.org/img/wn/${icon}@2x.png`; // връща URL
}



// СЪОБЩЕНИЯ ЗА ЗАРЕЖДАНЕ / ГРЕШКА
function showLoading() { // показва loading
    DOM.loading.classList.remove("hidden"); // маха hidden
}

function hideLoading() { // скрива loading
    DOM.loading.classList.add("hidden"); // добавя hidden
}

function showError(msg) { // показва грешка
    // Показваме текста на грешката
    DOM.error.textContent = msg; // текст на грешката
    DOM.error.classList.remove("hidden"); // показваме грешката

    // Скриваме секцията с времето
    DOM.weatherSection.classList.add("hidden"); // скриваме времето

    // Изчистваме старите данни
    DOM.cityName.textContent = ""; // чистим име
    DOM.temperature.textContent = ""; // чистим температура
    DOM.description.textContent = ""; // чистим описание
    DOM.humidity.textContent = ""; // чистим влажност
    DOM.windSpeed.textContent = ""; // чистим вятър

    // Нулираме иконата
    DOM.weatherIcon.src = ""; // чистим src
    DOM.weatherIcon.className = "fa-solid fa-cloud"; // fallback икона

    // Нулираме mood emoji
    DOM.moodEmoji.textContent = "🙂"; // връщаме стандартно емоджи
}

function hideError() { // скрива грешката
    DOM.error.classList.add("hidden"); // добавя hidden
}



// ДИНАМИЧЕН ФОН СПОРЕД ВРЕМЕТО
function updateBackground(conditionId) { // сменя фона
    document.body.className = ""; // махаме стария фон

    // Проверяваме по weather ID
    if (conditionId >= 200 && conditionId <= 232) { // буря
        document.body.classList.add("stormy");
    }
    else if (conditionId >= 300 && conditionId <= 321) { // ръмеж
        document.body.classList.add("rainy");
    }
    else if (conditionId >= 500 && conditionId <= 531) { // дъжд
        document.body.classList.add("rainy");
    }
    else if (conditionId >= 600 && conditionId <= 622) { // сняг
        document.body.classList.add("snowy");
    }
    else if (conditionId >= 701 && conditionId <= 781) { // мъгла
        document.body.classList.add("foggy");
    }
    else if (conditionId === 800) { // ясно
        document.body.classList.add("sunny");
    }
    else if (conditionId >= 801 && conditionId <= 804) { // облаци
        document.body.classList.add("cloudy");
    }
    else {
        document.body.classList.add("night"); // fallback фон
    }
}



// MOOD EMOJI СПОРЕД ВРЕМЕТО
function updateEmoji(conditionId) { // сменя емоджито
    const emoji = document.getElementById("mood-emoji"); // взимаме елемента

    // Избираме емоджи според weather ID
    if (conditionId >= 200 && conditionId <= 232) emoji.textContent = "⛈️"; // буря
    else if (conditionId >= 300 && conditionId <= 321) emoji.textContent = "🌦️"; // ръмеж
    else if (conditionId >= 500 && conditionId <= 531) emoji.textContent = "🌧️"; // дъжд
    else if (conditionId >= 600 && conditionId <= 622) emoji.textContent = "❄️"; // сняг
    else if (conditionId >= 701 && conditionId <= 781) emoji.textContent = "🌫️"; // мъгла
    else if (conditionId === 800) emoji.textContent = "😎"; // ясно
    else if (conditionId >= 801 && conditionId <= 804) emoji.textContent = "☁️"; // облаци
    else emoji.textContent = "🌍"; // fallback
}
