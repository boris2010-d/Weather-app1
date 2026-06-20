const DOM = { // object that stores all DOM elements
    searchForm: document.getElementById("search-form"), // get the form
    cityInput: document.getElementById("city-input"), // get the input field

    loading: document.getElementById("loading"), // loading message element
    error: document.getElementById("error"), // error message element

    weatherSection: document.getElementById("weather-section"), // weather section
    cityName: document.getElementById("city-name"), // city name
    temperature: document.getElementById("temperature"), // temperature
    description: document.getElementById("description"), // weather description
    weatherIcon: document.getElementById("weather-icon"), // weather icon (img)
    humidity: document.getElementById("humidity"), // humidity
    windSpeed: document.getElementById("wind-speed"), // wind speed

    moodEmoji: document.getElementById("mood-emoji"), // mood emoji

    alertSection: document.getElementById("alert-section"), // alert container
    alertText: document.getElementById("alert-text"), // alert text
    
    clearHistoryBtn: document.getElementById("clear-history-btn"), // clear history button

    // НОВИ ЕЛЕМЕНТИ ЗА СТРАНИЦАТА НА ДЕНЯ
    appHeader: document.querySelector(".app-header"),
    searchSection: document.querySelector(".search-section"),
    statusSection: document.querySelector(".status-section"),
    forecastSection: document.getElementById("forecast-section"),
    historySection: document.getElementById("history-section"),
    dayPage: document.getElementById("day-page"),
    dayBackBtn: document.getElementById("day-back-btn"),
    dayCity: document.getElementById("day-city"),
    dayDate: document.getElementById("day-date"),
    dayIcon: document.getElementById("day-icon"),
    dayTemp: document.getElementById("day-temp"),
    dayDesc: document.getElementById("day-desc"),
    dayHumidity: document.getElementById("day-humidity"),
    dayWind: document.getElementById("day-wind")
};

// API key for OpenWeatherMap
const API_KEY = "39935ee879cea278a3a5f968eadce457"; // API key

// FORM SUBMIT
DOM.searchForm.addEventListener("submit", (event) => { // listen for submit
    event.preventDefault(); // prevent page reload

    const city = DOM.cityInput.value.trim(); // get entered city
    if (!city) return; // stop if empty

    getWeather(city); // call weather function
});

// CLEAR HISTORY EVENT
DOM.clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem("history"); // изтрива записа от браузъра
    renderHistory(); // преначертава списъка (който вече ще е празен)
});

// НАЗАД БУТОН ЗА СТРАНИЦАТА НА ДЕНЯ
DOM.dayBackBtn.addEventListener("click", () => {
    DOM.dayPage.classList.add("hidden"); // Скриваме страницата за деня
    
    // Показваме старите секции обратно
    DOM.appHeader.classList.remove("hidden");
    DOM.searchSection.classList.remove("hidden");
    DOM.statusSection.classList.remove("hidden");
    DOM.weatherSection.classList.remove("hidden");
    DOM.forecastSection.classList.remove("hidden");
    DOM.historySection.classList.remove("hidden");
    if (DOM.alertText.textContent) DOM.alertSection.classList.remove("hidden");
});

// FETCH WEATHER FROM API
async function getWeather(city) { // async function for fetch
    try {
            showLoading();  // show loading message
            hideError();    // hide previous errors

            const url =
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=bg`; // build URL

            const response = await fetch(url); // send request
            const data = await response.json(); // get JSON

            if (data.cod !== 200) { // if API returns error
                throw new Error("Градът не е намерен."); // throw error
            }

        displayWeather(data); // display weather
        updateAlert(data);    // update weather alert
        saveToHistory(city);  // save city to history
        getForecast(city);    // load weekly forecast

    } catch (error) {
        showError(error.message); // show error message
    } finally {
        hideLoading(); // always hide loading
    }
}

// DISPLAY WEATHER
function displayWeather(data) { // function to visualize weather
    DOM.cityName.textContent = data.name; // city name
    DOM.temperature.textContent = `${Math.round(data.main.temp)}°C`; // temperature
    DOM.description.textContent = data.weather[0].description; // description
    DOM.humidity.textContent = `${data.main.humidity}%`; // humidity
    DOM.windSpeed.textContent = `${data.wind.speed} m/s`; // wind speed

    const iconCode = data.weather[0].icon; // icon code
    DOM.weatherIcon.src = getIconURL(iconCode); // set icon URL
    DOM.weatherIcon.alt = data.weather[0].description;

    updateBackground(data.weather[0].id); // change background
    updateEmoji(data.weather[0].id); // change emoji

    DOM.weatherSection.classList.remove("hidden"); // show weather section
    DOM.dayPage.classList.add("hidden"); // уверяваме се, че детайлната страница е скрита при ново търсене
}

// GET ICON URL
function getIconURL(icon) { // returns icon URL
    return `https://openweathermap.org/img/wn/${icon}@2x.png`; // return URL
}

// LOADING / ERROR MESSAGES
function showLoading() { // show loading
    DOM.loading.classList.remove("hidden"); // remove hidden
}

function hideLoading() { // hide loading
    DOM.loading.classList.add("hidden"); // add hidden
}

function showError(msg) { // show error
    DOM.error.textContent = msg; // set error text
    DOM.error.classList.remove("hidden"); // show error

    DOM.weatherSection.classList.add("hidden"); // hide weather
    DOM.alertSection.classList.add("hidden"); // hide alert
    DOM.forecastSection.classList.add("hidden"); // hide forecast
    DOM.dayPage.classList.add("hidden");

    DOM.cityName.textContent = ""; // clear city
    DOM.temperature.textContent = ""; // clear temperature
    DOM.description.textContent = ""; // clear description
    DOM.humidity.textContent = ""; // clear humidity
    DOM.windSpeed.textContent = ""; // clear wind

    DOM.weatherIcon.src = ""; // clear src

    DOM.moodEmoji.textContent = "🙂"; // default emoji
}

function hideError() { // hide error
    DOM.error.classList.add("hidden"); // add hidden
}

// DYNAMIC BACKGROUND BASED ON WEATHER
function updateBackground(conditionId) { // change background
    document.body.className = ""; // remove old background

    if (conditionId >= 200 && conditionId <= 232) { // storm
        document.body.classList.add("stormy");
    }
    else if (conditionId >= 300 && conditionId <= 321) { // drizzle
        document.body.classList.add("rainy");
    }
    else if (conditionId >= 500 && conditionId <= 531) { // rain
        document.body.classList.add("rainy");
    }
    else if (conditionId >= 600 && conditionId <= 622) { // snow
        document.body.classList.add("snowy");
    }
    else if (conditionId >= 701 && conditionId <= 781) { // fog
        document.body.classList.add("foggy");
    }
    else if (conditionId === 800) { // clear
        document.body.classList.add("sunny");
    }
    else if (conditionId >= 801 && conditionId <= 804) { // clouds
        document.body.classList.add("cloudy");
    }
    else {
        document.body.classList.add("night"); // fallback background
    }
}

// MOOD EMOJI BASED ON WEATHER
function updateEmoji(conditionId) { // change emoji
    const emoji = DOM.moodEmoji; // emoji element

    if (conditionId >= 200 && conditionId <= 232) emoji.textContent = "⛈️"; // storm
    else if (conditionId >= 300 && conditionId <= 321) emoji.textContent = "🌦️"; // drizzle
    else if (conditionId >= 500 && conditionId <= 531) emoji.textContent = "🌧️"; // rain
    else if (conditionId >= 600 && conditionId <= 622) emoji.textContent = "❄️"; // snow
    else if (conditionId >= 701 && conditionId <= 781) emoji.textContent = "🌫️"; // fog
    else if (conditionId === 800) emoji.textContent = "😎"; // clear
    else if (conditionId >= 801 && conditionId <= 804) emoji.textContent = "☁️"; // clouds
    else emoji.textContent = "🌍"; // fallback
}

// WEATHER ALERTS
function updateAlert(data) { // create simple alerts based on conditions
    const id = data.weather[0].id;
    const wind = data.wind.speed;
    const temp = data.main.temp;

    let message = "";

    if (id >= 200 && id <= 232) {
        message = "⚠ Силна буря! Бъди внимателен навън.";
    } else if (id >= 500 && id <= 531) {
        message = "☔ Вали дъжд. Вземи си чадър.";
    } else if (id >= 600 && id <= 622) {
        message = "❄ Сняг навън. Внимавай по пътищата.";
    } else if (id >= 701 && id <= 781) {
        message = "🌫 Намалена видимост. Шофирай внимателно.";
    } else if (wind >= 10) {
        message = "💨 Силен вятър. Внимавай с предмети навън.";
    } else if (temp >= 30) {
        message = "🔥 Много топло. Пий повече вода.";
    } else if (temp <= -5) {
        message = "🥶 Много студено. Облечи се добре.";
    }

    if (message) {
        DOM.alertText.textContent = message;
        DOM.alertSection.classList.remove("hidden");
    } else {
        DOM.alertSection.classList.add("hidden");
        DOM.alertText.textContent = "";
    }
}

// WEEKLY FORECAST – fetch
async function getForecast(city) {
    const url =
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=bg`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== "200") return;

    displayForecast(data);
}

// WEEKLY FORECAST – display cards
function displayForecast(data) {
    const container = document.getElementById("forecast-cards");
    container.innerHTML = "";

    const daily = {};
    data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];

        if (!daily[date]) {
            daily[date] = item;
        }
    });

    Object.values(daily).slice(0, 5).forEach(day => {
        const icon = day.weather[0].icon;
        const temp = Math.round(day.main.temp);
        const desc = day.weather[0].description;
        const date = day.dt_txt.split(" ")[0];
        // Взимаме влажност и вятър от обекта на прогнозата
        const humidity = day.main.humidity;
        const wind = day.wind.speed;

        const card = document.createElement("div");
        card.className = "forecast-card";
        card.style.cursor = "pointer"; // Правим го видимо, че може да се цъка

        card.innerHTML = `
            <p>${date}</p>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
            <p>${temp}°C</p>
            <p>${desc}</p>
        `;

        // СЪБИТИЕ ЗА КЛИК: Скрива всичко и отваря пълната страница за деня
        card.addEventListener("click", () => {
            DOM.appHeader.classList.add("hidden");
            DOM.searchSection.classList.add("hidden");
            DOM.statusSection.classList.add("hidden");
            DOM.weatherSection.classList.add("hidden");
            DOM.alertSection.classList.add("hidden");
            DOM.forecastSection.classList.add("hidden");
            DOM.historySection.classList.add("hidden");

            // Попълваме данните на новата страница
            DOM.dayCity.textContent = DOM.cityName.textContent;
            DOM.dayDate.textContent = date;
            DOM.dayIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
            DOM.dayTemp.textContent = `${temp}°C`;
            DOM.dayDesc.textContent = desc;
            DOM.dayHumidity.innerHTML = `<span class="extra-label">Влажност</span> <b>${humidity}%</b>`;
            DOM.dayWind.innerHTML = `<span class="extra-label">Вятър</span> <b>${wind} m/s</b>`;

            // Показваме страницата
            DOM.dayPage.classList.remove("hidden");
        });

        container.appendChild(card);
    });

    DOM.forecastSection.classList.remove("hidden");
}

// SEARCH HISTORY – save city
function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem("history")) || [];

    history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
    history.unshift(city);
    history = history.slice(0, 10);

    localStorage.setItem("history", JSON.stringify(history));

    renderHistory();
}

// SEARCH HISTORY – render list
function renderHistory() {
    const list = document.getElementById("history-list");
    const history = JSON.parse(localStorage.getItem("history")) || [];

    // Показва бутона за триене само ако има градове в историята
    if (history.length === 0) {
        DOM.clearHistoryBtn.classList.add("hidden");
    } else {
        DOM.clearHistoryBtn.classList.remove("hidden");
    }

    list.innerHTML = "";

    history.forEach(city => {
        const li = document.createElement("li");
        li.textContent = city;

        li.addEventListener("click", () => {
            DOM.cityInput.value = city;
            getWeather(city);
        });

        list.appendChild(li);
    });
}

// Load history on start
renderHistory();