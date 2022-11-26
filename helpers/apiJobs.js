const axios = require("axios");
const City = require("../models/city");
const Temp = require("../models/temp");
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

/**
 * Method to get base city information from backend db to use for API call.
 *
 * @returns {array} [{city_name, country_code, lat, lon}, ...]
 */
const getAllCities = async () => {
	try {
		const cities = await City.getAllCities();
		return cities;
	} catch (err) {
		console.log(err);
	}
};

/**
 * Helper function to round a number to two decimal places.
 *
 *
 * @param {number} num
 * @returns {number}
 */
function roundToTwo(num) {
	return +(Math.round(num + "e+2") + "e-2");
}

/**
 * Function to get weather AND air quality information from external API endpoint.
 *
 * Method returns an array that contains the city name alon with weather and air quality information in a large array.
 * @param {string} key
 * @returns {array} [{data}, {data}, ...]
 */
const getWeatherData = async (key) => {
	const allCities = await getAllCities();
	const allPromises = [];
	const allAirQuality = [];

	try {
		const data = [];
		for (let item of allCities) {
			allPromises.push(
				axios.get(
					`${BASE_URL}?lat=${item.lat}&lon=${item.lon}&appid=${key}`,
				),
			);
			allAirQuality.push(
				axios.get(
					`http://api.openweathermap.org/data/2.5/air_pollution?lat=${item.lat}&lon=${item.lon}&appid=${key}`,
				),
			);
		}
		const res = await Promise.all(allPromises);
		const airQual = await Promise.all(allAirQuality);

		for (let i = 0; i < res.length; i++) {
			let currItemObj = res[i].data;
			let currAirQual = airQual[i].data;

			let { temp, temp_min, temp_max } = currItemObj.main;
			let currTempFaren = (temp - 273) * 1.8 + 32;
			let currTempCel = temp - 273.15;
			currTempFaren = roundToTwo(currTempFaren);
			currTempCel = roundToTwo(currTempCel);

			let minTempFar = (temp_min - 273) * 1.8 + 32;
			let minTempCel = temp_min - 273.15;
			let maxTempFar = (temp_max - 273) * 1.8 + 32;
			let maxTempCel = temp_max - 273.15;

			minTempFar = roundToTwo(minTempFar);
			minTempCel = roundToTwo(minTempCel);
			maxTempFar = roundToTwo(maxTempFar);
			maxTempCel = roundToTwo(maxTempCel);

			data.push({
				cityName: allCities[i].city_name,
				weather: currItemObj.weather[0],
				currTempCel,
				currTempFar: currTempFaren,
				minTempCel,
				maxTempCel,
				minTempFar,
				maxTempFar,
				airQuality: currAirQual.list[0].main,
			});
		}
		return data;
	} catch (err) {
		console.log(err);
	}
};

/**
 * function that will make call to API endpoint and save the data returned to the backend database table for weather data.
 *
 * DOES NOT RETURN ANYTHING BUT LOGS WHEN TASK IS STATRING AND COMPLETE.
 *
 * @param {string} key
 * @returns {void}
 */
const addNewData = async (key) => {
	console.log("START TASK...");
	const weatherData = await getWeatherData(key);
	const promises = [];
	try {
		for (let item of weatherData) {
			promises.push(
				Temp.addNewTempData({
					cityName: item.cityName,
					currTempCel: item.currTempCel,
					currTempFar: item.currTempFar,
					minTempCel: item.minTempCel,
					maxTempCel: item.maxTempCel,
					minTempFar: item.minTempFar,
					maxTempFar: item.maxTempFar,
					airQuality: item.airQuality.aqi,
				}),
			);
		}
		await Promise.all(promises);
		console.log("TASK COMPLETE");
	} catch (err) {
		console.log(err);
	}
};

module.exports = { addNewData };
