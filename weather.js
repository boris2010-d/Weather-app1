const DOM = { // object that stores all DOM elements
    searchForm: document.getElementById("search-form"), // get the form
    cityInput: document.getElementById("city-input"), // get the input field

    loading: document.getElementById("loading"), // loading message element
    error: document.getElementById("error"), // error message element

    weatherSection: document.getElementById("weather-section"), // weather section
    cityName: document.getElementById("city-name"), // city name
    temperature: document.getElementById("temperature"), // temperature
    description: document.getElementById("description"), // weather description
    weatherIcon: document.getElementById("weather-icon"), // weather icon
    humidity: document.getElementById("humidity"), // humidity
    windSpeed: document.getElementById("wind-speed"), // wind speed

    moodEmoji: document.getElementById("mood-emoji"), // mood emoji

    alertSection: document.getElementById("alert-section"), // alert container
    alertText: document.getElementById("alert-text"), // alert text
    
    clearHistoryBtn: document.getElementById("clear-history-btn"), // clear history button
    unitToggleBtn: document.getElementById("unit-toggle"), // Бутон за Фаренхайт

    // ЕЛЕМЕНТИ ЗА СТРАНИЦАТА НА ДЕНЯ И ЧАСОВЕТЕ
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

// Глобални променливи за управление на мерните единици и кеша
let currentUnit = "C";
let currentWeatherData = null;
let currentForecastData = null;

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
    document.getElementById("main-hourly-section").classList.remove("hidden");
    if (DOM.alertText.textContent) DOM.alertSection.classList.remove("hidden");
});

// Помощна функция за форматиране на градуси спрямо бутона
function formatTemp(celsius) {
    if (currentUnit === "C") {
        return `${Math.round(celsius)}°C`;
    } else {
        const fahrenheit = (celsius * 9) / 5 + 32;
        return `${Math.round(fahrenheit)}°F`;
    }
}

// СЛУШАТЕЛ ЗА БУТОНА (Обръща всичко на екрана!)
DOM.unitToggleBtn.addEventListener("click", () => {
    if (!currentWeatherData || !currentForecastData) return;

    currentUnit = currentUnit === "C" ? "F" : "C";
    DOM.unitToggleBtn.textContent = currentUnit === "C" ? "Промени на °F" : "Промени на °C";

    // Опресняваме визуализациите с новата мерна единица
    displayWeather(currentWeatherData);
    displayForecast(currentForecastData);
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

        currentWeatherData = data; // Запазваме в кеша
        currentUnit = "C"; // Ресет на Целзий при нов град
        DOM.unitToggleBtn.textContent = "Промени на °F";

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
    DOM.temperature.textContent = formatTemp(data.main.temp); // Конвертирана температура
    DOM.description.textContent = data.weather[0].description; // description
    DOM.humidity.textContent = `${data.main.humidity}%`; // humidity
    DOM.windSpeed.textContent = `${data.wind.speed} m/s`; // wind speed

    const iconCode = data.weather[0].icon; 
    DOM.weatherIcon.className = "weather-icon-img"; 
    DOM.weatherIcon.innerHTML = `<img src="${getIconURL(iconCode)}" alt="${data.weather[0].description}" style="width:100px; height:100px;">`;

    updateBackground(data.weather[0].id); // change background
    updateEmoji(data.weather[0].id); // change emoji

    DOM.weatherSection.classList.remove("hidden"); // show weather section
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
    document.getElementById("main-hourly-section").classList.add("hidden");

    DOM.cityName.textContent = ""; 
    DOM.temperature.textContent = ""; 
    DOM.description.textContent = ""; 
    DOM.humidity.textContent = ""; 
    DOM.windSpeed.textContent = ""; 

    DOM.weatherIcon.innerHTML = ""; 
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

    if (conditionId >= 200 && conditionId <= 232) emoji.textContent = "⛈️"; 
    else if (conditionId >= 300 && conditionId <= 321) emoji.textContent = "🌦️"; 
    else if (conditionId >= 500 && conditionId <= 531) emoji.textContent = "🌧️"; 
    else if (conditionId >= 600 && conditionId <= 622) emoji.textContent = "❄️"; 
    else if (conditionId >= 701 && conditionId <= 781) emoji.textContent = "🌫️"; 
    else if (conditionId === 800) emoji.textContent = "😎"; 
    else if (conditionId >= 801 && conditionId <= 804) emoji.textContent = "☁️"; 
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

    currentForecastData = data; // Кешираме прогнозата
    displayForecast(data);
}

// WEEKLY FORECAST & HOURLY FORECAST
function displayForecast(data) {
    const container = document.getElementById("forecast-cards");
    container.innerHTML = "";

    const dailyData = {};
    
    data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!dailyData[date]) {
            dailyData[date] = [];
        }
        dailyData[date].push(item);
    });

    // --- Напълване на часовете за ДНЕШНИЯ ден на НАЧАЛНИЯ екран ---
    const mainHourlySection = document.getElementById("main-hourly-section");
    const mainHourlyContainer = document.getElementById("main-hourly-cards");
    mainHourlyContainer.innerHTML = "";
    
    const todayDate = Object.keys(dailyData)[0]; 
    dailyData[todayDate].forEach(hourItem => {
        const time = hourItem.dt_txt.split(" ")[1].substring(0, 5); 
        const hTemp = hourItem.main.temp;
        const hIcon = hourItem.weather[0].icon;

        const hourCard = document.createElement("div");
        hourCard.className = "hour-card";
        hourCard.innerHTML = `
            <p class="hour-time">${time}</p>
            <img src="https://openweathermap.org/img/wn/${hIcon}.png" alt="weather">
            <p class="hour-temp">${formatTemp(hTemp)}</p>
        `;
        mainHourlyContainer.appendChild(hourCard);
    });
    mainHourlySection.classList.remove("hidden");

    // Показване на 5-те дни в седмичната прогноза
    Object.keys(dailyData).slice(0, 5).forEach(date => {
        const dayIntervals = dailyData[date];
        const mainDayInfo = dayIntervals[0];

        const icon = mainDayInfo.weather[0].icon;
        const temp = mainDayInfo.main.temp;
        const desc = mainDayInfo.weather[0].description;

        const card = document.createElement("div");
        card.className = "forecast-card";
        card.style.cursor = "pointer";

        card.innerHTML = `
            <p>${date}</p>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
            <p>${formatTemp(temp)}</p>
            <p>${desc}</p>
        `;

        card.addEventListener("click", () => {
            DOM.appHeader.classList.add("hidden");
            DOM.searchSection.classList.add("hidden");
            DOM.statusSection.classList.add("hidden");
            DOM.weatherSection.classList.add("hidden");
            DOM.alertSection.classList.add("hidden");
            DOM.forecastSection.classList.add("hidden");
            DOM.historySection.classList.add("hidden");
            mainHourlySection.classList.add("hidden");

            DOM.dayCity.textContent = DOM.cityName.textContent;
            DOM.dayDate.textContent = date;
            
            DOM.dayIcon.className = "weather-icon-img";
            DOM.dayIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" style="width:100px; height:100px;">`;
            
            DOM.dayTemp.textContent = formatTemp(temp);
            DOM.dayDesc.textContent = desc;
            DOM.dayHumidity.innerHTML = `<span class="extra-label">Влажност</span> <b>${mainDayInfo.main.humidity}%</b>`;
            DOM.dayWind.innerHTML = `<span class="extra-label">Вятър</span> <b>${mainDayInfo.wind.speed} m/s</b>`;

            const hourlyContainer = document.getElementById("day-hourly-cards");
            hourlyContainer.innerHTML = "";

            dayIntervals.forEach(hourItem => {
                const time = hourItem.dt_txt.split(" ")[1].substring(0, 5); 
                const hTemp = hourItem.main.temp;
                const hIcon = hourItem.weather[0].icon;

                const hourCard = document.createElement("div");
                hourCard.className = "hour-card";
                hourCard.innerHTML = `
                    <p class="hour-time">${time}</p>
                    <img src="https://openweathermap.org/img/wn/${hIcon}.png" alt="weather">
                    <p class="hour-temp">${formatTemp(hTemp)}</p>
                `;
                hourlyContainer.appendChild(hourCard);
            });

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

renderHistory();