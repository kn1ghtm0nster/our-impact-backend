"use strict";

const db = require("../db");

const { BadRequestError } = require("../expressError");

class TempData {
    /**
     * Main SQL query to get the most recent weather data from the API backend job. Function returns data in descending order from their insert time.
     * 
     * @returns {array} [{cityName, currTempCel, currTempFar, minTempCel, maxTempCel, minTempFar, maxTempFar, airQuality}, ...]
     */
    static async getTemps() {
        const data = await db.query(`
            SELECT 
            id,
            city AS "cityName",
            curr_temp_cel AS "currTempCel",
            curr_temp_far AS "currTempFar",
            min_temp_cel AS "minTempCel",
            max_temp_cel AS "maxTempCel",
            min_temp_far AS "minTempFar",
            max_temp_far AS "maxTempFar",
            air_quality AS "airQuality"
            FROM 
            temp_data
            ORDER BY date_added DESC
            LIMIT 20
        `);

        return data.rows;
    }

    /**
     * Method will be used with cron-job under helper file to ping open weather API and send data from the 20 cities to the backend db every day at 12:30PM CST.
     * 
     * If all data is received and no issues are reported, function returns string.
     * 
     * If there are any issues inserting data into the backend db, throw new BadRequestError
     * 
     * @param {object} cityName
     * @param {object} currTempCel
     * @param {object} currTempFar
     * @param {object} minTempCel
     * @param {object} maxTempCel
     * @param {object} minTempFar
     * @param {object} maxTempFar
     * @param {object} airQuality
     * @returns {string} "NEW DATA RECEIVED AND SAVED TO DB."
     */
    static async addNewTempData({
        cityName,
        currTempCel,
        currTempFar,
        minTempCel,
        maxTempCel,
        minTempFar,
        maxTempFar,
        airQuality,
    }) {
        try {
            await db.query(
                `
            INSERT INTO temp_data (city, curr_temp_cel, curr_temp_far, min_temp_cel, max_temp_cel, min_temp_far, max_temp_far, air_quality)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
                [
                    cityName,
                    currTempCel,
                    currTempFar,
                    minTempCel,
                    maxTempCel,
                    minTempFar,
                    maxTempFar,
                    airQuality,
                ],
            );
        } catch (err) {
            throw new BadRequestError(`ERROR INSERTING NEW DATA: ${err}`);
        }
        return "NEW DATA RECEIVED AND SAVED TO DB.";
    }
}

module.exports = TempData;
