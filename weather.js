const DOM = { // Object that stores references to all important DOM elements in the HTML
    searchForm: document.getElementById("search-form"), // The search form
    cityInput: document.getElementById("city-input"), // The text input field for entering a city

    loading: document.getElementById("loading"), // Element for the "Loading..." message
    error: document.getElementById("error"), // Element for displaying errors

    weatherSection: document.getElementById("weather-section"), // Main section for current weather
    cityName: document.getElementById("city-name"), // City name
    temperature: document.getElementById("temperature"), // Current temperature
    description: document.getElementById("description"), // Text description of the weather
    weatherIcon: document.getElementById("weather-icon"), // Container for the weather icon
    humidity: document.getElementById("humidity"), // Humidity value
    windSpeed: document.getElementById("wind-speed"), // Wind speed value

    moodEmoji: document.getElementById("mood-emoji"), // Emoji corresponding to the weather

    alertSection: document.getElementById("alert-section"), // Container for weather alerts
    alertText: document.getElementById("alert-text"), // Text of the alert
    
    clearHistoryBtn: document.getElementById("clear-history-btn"), // Button to clear search history
    unitToggleBtn: document.getElementById("unit-toggle"), // Button to toggle between Celsius / Fahrenheit

    // ELEMENTS FOR THE DETAILED PAGE OF THE SELECTED DAY AND HOURS
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

// API key to access OpenWeatherMap services
const API_KEY = "39935ee879cea278a3a5f968eadce457"; 

// GLOBAL VARIABLES FOR UNIT MANAGEMENT AND CACHING
let currentUnit = "C"; // Stores the current unit ("C" for Celsius, "F" for Fahrenheit)
let currentWeatherData = null; // Cache: Stores the JSON object with the current weather from the last search
let currentForecastData = null; // Cache: Stores the JSON object with the 5-day forecast from the last search

// EVENT: SUBMITTING THE SEARCH FORM
DOM.searchForm.addEventListener("submit", (event) => { 
    event.preventDefault(); // Prevents the default page reload

    const city = DOM.cityInput.value.trim(); // Gets the city name and removes extra spaces
    if (!city) return; // Stops execution if the field is empty

    getWeather(city); // Calls the function to fetch the weather
});

// EVENT: CLEARING THE SEARCH HISTORY
DOM.clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem("history"); // Deletes the saved history from the browser storage
    renderHistory(); // Redraws the list on the screen to show it empty
});

// EVENT: "BACK" BUTTON FROM THE DETAILED DAY PAGE
DOM.dayBackBtn.addEventListener("click", () => {
    DOM.dayPage.classList.add("hidden"); // Hides the detailed day page
    
    // Shows all hidden sections back on the main screen
    DOM.appHeader.classList.remove("hidden");
    DOM.searchSection.classList.remove("hidden");
    DOM.statusSection.classList.remove("hidden");
    DOM.weatherSection.classList.remove("hidden");
    DOM.forecastSection.classList.remove("hidden");
    DOM.historySection.classList.remove("hidden");
    document.getElementById("main-hourly-section").classList.remove("hidden");
    if (DOM.alertText.textContent) DOM.alertSection.classList.remove("hidden"); // Shows the alert only if one exists
});

// FUNCTION FOR FORMATTING DEGREES (CONVERTER)
function formatTemp(celsius) {
    if (currentUnit === "C") {
        return `${Math.round(celsius)}°C`; // Returns rounded value in Celsius
    } else {
        const fahrenheit = (celsius * 9) / 5 + 32; // Mathematical formula to convert to Fahrenheit
        return `${Math.round(fahrenheit)}°F`; // Returns rounded value in Fahrenheit
    }
}

// EVENT: CLICK ON THE UNIT TOGGLE BUTTON (°C / °F)
DOM.unitToggleBtn.addEventListener("click", () => {
    // Stops execution if there is no loaded and cached data for a city yet
    if (!currentWeatherData || !currentForecastData) return;

    // Toggles the current unit to the opposite one
    currentUnit = currentUnit === "C" ? "F" : "C";
    // Updates the button text to suggest the next possible switch
    DOM.unitToggleBtn.textContent = currentUnit === "C" ? "Промени на °F" : "Промени на °C";

    // Redraws the entire screen synchronously with the new values
    displayWeather(currentWeatherData); // Updates the current weather
    displayForecast(currentForecastData); // Updates the hourly and 5-day forecast
});

// ASYNCHRONOUS FUNCTION TO FETCH CURRENT WEATHER FROM THE API
async function getWeather(city) { 
    try {
        showLoading();  // Shows the loading text message
        hideError();    // Hides old error messages

        // URL for the request to OpenWeatherMap API with parameters for city, metric units, and Bulgarian language
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=bg`; 

        const response = await fetch(url); // Sends the request to the server
        const data = await response.json(); // Converts the received response into a JavaScript object

        if (data.cod !== 200) { // Checks if the API returns a code other than success (200)
            throw new Error("Градът не е намерен."); // Throws an error that goes to the catch block
        }

        currentWeatherData = data; // Saves data to the global cache for current weather
        currentUnit = "C"; // Resets the default unit to Celsius for every new search
        DOM.unitToggleBtn.textContent = "Промени на °F"; // Restores the initial button text

        displayWeather(data); // Visualizes current weather on the screen
        updateAlert(data);    // Checks and activates alerts (if dangerous conditions exist)
        saveToHistory(city);  // Saves the city to the search history
        getForecast(city);    // Starts fetching the 5-day forecast for the same city

    } catch (error) {
        showError(error.message); // In case of a problem, visualizes the error text
    } finally {
        hideLoading(); // Hides the loading message regardless of whether the request succeeded or failed
    }
}

// FUNCTION TO VISUALIZE CURRENT WEATHER
function displayWeather(data) { 
    DOM.cityName.textContent = data.name; // Displays the city name
    DOM.temperature.textContent = formatTemp(data.main.temp); // Displays the temperature through the converter function
    DOM.description.textContent = data.weather[0].description; // Shows the description (e.g., "broken clouds")
    DOM.humidity.textContent = `${data.main.humidity}%`; // Shows the humidity percentage
    DOM.windSpeed.textContent = `${data.wind.speed} m/s`; // Shows the wind speed in meters per second

    // Working with the icon: Returning the original graphical image from the API instead of broken Font Awesome classes
    const iconCode = data.weather[0].icon; 
    DOM.weatherIcon.className = "weather-icon-img"; // Sets a fixed CSS class for correct positioning
    DOM.weatherIcon.innerHTML = `<img src="${getIconURL(iconCode)}" alt="${data.weather[0].description}" style="width:100px; height:100px;">`;

    updateBackground(data.weather[0].id); // Changes the background color/image of the app based on the weather
    updateEmoji(data.weather[0].id); // Changes the large emoji based on the meteorological condition

    DOM.weatherSection.classList.remove("hidden"); // Shows the main weather section on the screen
}

// FUNCTION TO ASSEMBLE LINK TO OFFICIAL OPENWEATHERMAP ICONS
function getIconURL(icon) { 
    return `https://openweathermap.org/img/wn/${icon}@2x.png`; // Returns a full URL address with higher quality (@2x)
}

// FUNCTIONS FOR INTERFACE MANAGEMENT (LOADING AND ERRORS)
function showLoading() { 
    DOM.loading.classList.remove("hidden"); // Shows the loading indicator
}

function hideLoading() { 
    DOM.loading.classList.add("hidden"); // Hides the loading indicator
}

function showError(msg) { 
    DOM.error.textContent = msg; // Sets the error text
    DOM.error.classList.remove("hidden"); // Shows the error message

    // Hides all other sections so old data does not mix with the error
    DOM.weatherSection.classList.add("hidden"); 
    DOM.alertSection.classList.add("hidden"); 
    DOM.forecastSection.classList.add("hidden"); 
    DOM.dayPage.classList.add("hidden");
    document.getElementById("main-hourly-section").classList.add("hidden");

    // Resets the text content of main fields
    DOM.cityName.textContent = ""; 
    DOM.temperature.textContent = ""; 
    DOM.description.textContent = ""; 
    DOM.humidity.textContent = ""; 
    DOM.windSpeed.textContent = ""; 

    DOM.weatherIcon.innerHTML = ""; 
    DOM.moodEmoji.textContent = "🙂"; // Restores the default emoji
}

function hideError() { 
    DOM.error.classList.add("hidden"); // Hides the error field
}

// DYNAMICALLY CHANGING THE PAGE BACKGROUND BASED ON THE WEATHER CONDITION ID
function updateBackground(conditionId) { 
    document.body.className = ""; // Clears all previous classes from the body tag

    if (conditionId >= 200 && conditionId <= 232) { // Thunderstorm
        document.body.classList.add("stormy");
    }
    else if (conditionId >= 300 && conditionId <= 321) { // Drizzle
        document.body.classList.add("rainy");
    }
    else if (conditionId >= 500 && conditionId <= 531) { // Rain
        document.body.classList.add("rainy");
    }
    else if (conditionId >= 600 && conditionId <= 622) { // Snow
        document.body.classList.add("snowy");
    }
    else if (conditionId >= 701 && conditionId <= 781) { // Fog / Reduced visibility
        document.body.classList.add("foggy");
    }
    else if (conditionId === 800) { // Clear sky
        document.body.classList.add("sunny");
    }
    else if (conditionId >= 801 && conditionId <= 804) { // Cloudy
        document.body.classList.add("cloudy");
    }
    else {
        document.body.classList.add("night"); // Fallback option (Night / Dark background)
    }
}

// CHANGING THE MOOD EMOJI BASED ON WEATHER CONDITIONS
function updateEmoji(conditionId) { 
    const emoji = DOM.moodEmoji; 

    if (conditionId >= 200 && conditionId <= 232) emoji.textContent = "⛈️"; 
    else if (conditionId >= 300 && conditionId <= 321) emoji.textContent = "🌦️"; 
    else if (conditionId >= 500 && conditionId <= 531) emoji.textContent = "🌧️"; 
    else if (conditionId >= 600 && conditionId <= 622) emoji.textContent = "❄️"; 
    else if (conditionId >= 701 && conditionId <= 781) emoji.textContent = "🌫️"; 
    else if (conditionId === 800) emoji.textContent = "😎"; 
    else if (conditionId >= 801 && conditionId <= 804) emoji.textContent = "☁️"; 
    else emoji.textContent = "🌍"; 
}

// GENERATING LOCAL ALERTS BASED ON FETCHED WEATHER DATA
function updateAlert(data) { 
    const id = data.weather[0].id;
    const wind = data.wind.speed;
    const temp = data.main.temp;

    let message = ""; // Variable that will contain the final text

    // Checks for dangerous or specific weather conditions
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

    // If a message is generated, shows it, otherwise hides the alert container
    if (message) {
        DOM.alertText.textContent = message;
        DOM.alertSection.classList.remove("hidden");
    } else {
        DOM.alertSection.classList.add("hidden");
        DOM.alertText.textContent = "";
    }
}

// ASYNCHRONOUS FUNCTION TO FETCH THE 5-DAY FORECAST
async function getForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=bg`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== "200") return; // If a problem occurs with the forecast, stops execution

    currentForecastData = data; // Saves the data to the global forecast cache
    displayForecast(data); // Calls the function to visualize forecasts
}

// VISUALIZATION OF WEEKLY AND HOURLY FORECAST WITH SYNCHRONIZED DEGREES
function displayForecast(data) {
    const container = document.getElementById("forecast-cards");
    container.innerHTML = ""; // Clears old cards from previous searches

    const dailyData = {}; // Object where we will group three-hour intervals by dates
    
    // Algorithm for grouping data by days (API returns a list of data every 3 hours)
    data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0]; // Takes only the date (YYYY-MM-DD), ignoring the time
        if (!dailyData[date]) {
            dailyData[date] = []; // Creates an empty array for the new day
        }
        dailyData[date].push(item); // Adds the three-hour interval to the corresponding day
    });

    // --- POPULATING HOURS FOR TODAY ON THE MAIN SCREEN ---
    const mainHourlySection = document.getElementById("main-hourly-section");
    const mainHourlyContainer = document.getElementById("main-hourly-cards");
    mainHourlyContainer.innerHTML = "";
    
    const todayDate = Object.keys(dailyData)[0]; // Takes the first date from the list (which is today)
    dailyData[todayDate].forEach(hourItem => {
        const time = hourItem.dt_txt.split(" ")[1].substring(0, 5); // Cuts the time into HH:MM format
        const hTemp = hourItem.main.temp;
        const hIcon = hourItem.weather[0].icon;

        const hourCard = document.createElement("div");
        hourCard.className = "hour-card";
        // The temperature in the small hour card is passed through the formatTemp converter
        hourCard.innerHTML = `
            <p class="hour-time">${time}</p>
            <img src="https://openweathermap.org/img/wn/${hIcon}.png" alt="weather">
            <p class="hour-temp">${formatTemp(hTemp)}</p> 
        `;
        mainHourlyContainer.appendChild(hourCard);
    });
    mainHourlySection.classList.remove("hidden"); // Shows the hourly section for today

    // --- CREATING CARDS FOR THE 5-DAY FORECAST ---
    Object.keys(dailyData).slice(0, 5).forEach(date => {
        const dayIntervals = dailyData[date]; // All hourly intervals for the specific day
        const mainDayInfo = dayIntervals[0]; // We take the first available interval for baseline information

        const icon = mainDayInfo.weather[0].icon;
        const temp = mainDayInfo.main.temp;
        const desc = mainDayInfo.weather[0].description;

        const card = document.createElement("div");
        card.className = "forecast-card";
        card.style.cursor = "pointer"; // Changes the cursor to a pointer to show it is clickable

        // Temperature here is also displayed according to the selected unit (°C or °F) via formatTemp
        card.innerHTML = `
            <p>${date}</p>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
            <p>${formatTemp(temp)}</p>
            <p>${desc}</p>
        `;

        // EVENT: CLICK ON A CARD FROM THE 5-DAY FORECAST (OPENING THE DETAILED PAGE)
        card.addEventListener("click", () => {
            // Hides all elements from the main screen of the application
            DOM.appHeader.classList.add("hidden");
            DOM.searchSection.classList.add("hidden");
            DOM.statusSection.classList.add("hidden");
            DOM.weatherSection.classList.add("hidden");
            DOM.alertSection.classList.add("hidden");
            DOM.forecastSection.classList.add("hidden");
            DOM.historySection.classList.add("hidden");
            mainHourlySection.classList.add("hidden");

            // Populates the detailed day page with the corresponding data and icons
            DOM.dayCity.textContent = DOM.cityName.textContent;
            DOM.dayDate.textContent = date;
            
            DOM.dayIcon.className = "weather-icon-img";
            DOM.dayIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" style="width:100px; height:100px;">`;
            
            // Degrees on the detailed page also comply with the formatTemp converter
            DOM.dayTemp.textContent = formatTemp(temp);
            DOM.dayDesc.textContent = desc;
            DOM.dayHumidity.innerHTML = `<span class="extra-label">Влажност</span> <b>${mainDayInfo.main.humidity}%</b>`;
            DOM.dayWind.innerHTML = `<span class="extra-label">Вятър</span> <b>${mainDayInfo.wind.speed} m/s</b>`;

            // Populating the hourly forecast inside the detailed page for the specific day
            const hourlyContainer = document.getElementById("day-hourly-cards");
            hourlyContainer.innerHTML = "";

            dayIntervals.forEach(hourItem => {
                const time = hourItem.dt_txt.split(" ")[1].substring(0, 5); 
                const hTemp = hourItem.main.temp;
                const hIcon = hourItem.weather[0].icon;

                const hourCard = document.createElement("div");
                hourCard.className = "hour-card";
                // Hourly degrees on the detailed page are converted correctly
                hourCard.innerHTML = `
                    <p class="hour-time">${time}</p>
                    <img src="https://openweathermap.org/img/wn/${hIcon}.png" alt="weather">
                    <p class="hour-temp">${formatTemp(hTemp)}</p>
                `;
                hourlyContainer.appendChild(hourCard);
            });

            DOM.dayPage.classList.remove("hidden"); // Shows the fully populated detailed page on the screen
        });

        container.appendChild(card); // Adds the finished card to the forecast container
    });

    DOM.forecastSection.classList.remove("hidden"); // Shows the forecast section on the screen
}

// SEARCH HISTORY: SAVING A CITY TO LOCALSTORAGE
function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem("history")) || []; // Gets existing history or creates a new array

    // Removes the city if it already exists in the list to avoid duplication
    history = history.filter(item => item.toLowerCase() !== city.toLowerCase());
    history.unshift(city); // Adds the new city to the very beginning of the array (top)
    history = history.slice(0, 10); // Limits the list to a maximum of 10 cities

    localStorage.setItem("history", JSON.stringify(history)); // Saves the updated array back to the browser

    renderHistory(); // Calls redrawing of the list on the screen
}

// SEARCH HISTORY: DRAWING ON THE SCREEN
function renderHistory() {
    const list = document.getElementById("history-list");
    const history = JSON.parse(localStorage.getItem("history")) || [];

    // If the list is empty, hides the clear button, otherwise shows it
    if (history.length === 0) {
        DOM.clearHistoryBtn.classList.add("hidden");
    } else {
        DOM.clearHistoryBtn.classList.remove("hidden");
    }

    list.innerHTML = ""; // Clears the old list from the screen

    // Generates an HTML <li> element for each city from the history
    history.forEach(city => {
        const li = document.createElement("li");
        li.textContent = city;

        // EVENT: CLICK ON A CITY FROM THE HISTORY (QUICK SEARCH)
        li.addEventListener("click", () => {
            DOM.cityInput.value = city; // Fills the city into the text field automatically
            getWeather(city); // Starts search for it directly
        });

        list.appendChild(li); // Adds the element to the HTML list
    });
}

// Initial call upon application load to show history if any is saved
renderHistory();