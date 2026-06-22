// api.js
import { API_KEY, state, DOM } from './dom.js';
import { showLoading, hideError, showError, hideLoading, displayWeather, updateAlert, saveToHistory, displayForecast } from './app.js';

// ASYNCHRONOUS FUNCTION TO FETCH CURRENT WEATHER FROM THE API
export async function getWeather(city) { 
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

        state.currentWeatherData = data; // Saves data to the global cache for current weather
        state.currentUnit = "C"; // Resets the default unit to Celsius for every new search
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

// ASYNCHRONOUS FUNCTION TO FETCH THE 5-DAY FORECAST
export async function getForecast(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=bg`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== "200") return; // If a problem occurs with the forecast, stops execution

    state.currentForecastData = data; // Saves the data to the global forecast cache
    displayForecast(data); // Calls the function to visualize forecasts
}