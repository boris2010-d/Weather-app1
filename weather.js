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

    moodEmoji: document.getElementById("mood-emoji") // mood emoji
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
        saveToHistory(city);  // save city to history

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

    DOM.cityName.textContent = ""; // clear city
    DOM.temperature.textContent = ""; // clear temperature
    DOM.description.textContent = ""; // clear description
    DOM.humidity.textContent = ""; // clear humidity
    DOM.windSpeed.textContent = ""; // clear wind

    DOM.weatherIcon.src = ""; // clear src
    DOM.weatherIcon.className = "fa-solid fa-cloud"; // fallback icon

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
    const emoji = document.getElementById("mood-emoji"); // get emoji element

    if (conditionId >= 200 && conditionId <= 232) emoji.textContent = "⛈️"; // storm
    else if (conditionId >= 300 && conditionId <= 321) emoji.textContent = "🌦️"; // drizzle
    else if (conditionId >= 500 && conditionId <= 531) emoji.textContent = "🌧️"; // rain
    else if (conditionId >= 600 && conditionId <= 622) emoji.textContent = "❄️"; // snow
    else if (conditionId >= 701 && conditionId <= 781) emoji.textContent = "🌫️"; // fog
    else if (conditionId === 800) emoji.textContent = "😎"; // clear
    else if (conditionId >= 801 && conditionId <= 804) emoji.textContent = "☁️"; // clouds
    else emoji.textContent = "🌍"; // fallback
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
