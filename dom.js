// dom.js

export const DOM = {
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
    moodEmoji: document.getElementById("mood-emoji"),
    alertSection: document.getElementById("alert-section"),
    alertText: document.getElementById("alert-text"),
    clearHistoryBtn: document.getElementById("clear-history-btn"),
    unitToggleBtn: document.getElementById("unit-toggle"),

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
export const API_KEY = "39935ee879cea278a3a5f968eadce457"; 

// GLOBAL VARIABLES FOR UNIT MANAGEMENT AND CACHING
export const state = {
    currentUnit: "C",
    currentWeatherData: null,
    currentForecastData: null
};