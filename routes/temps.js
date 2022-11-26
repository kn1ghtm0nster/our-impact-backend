"use strict";

const express = require("express");
const TempData = require('../models/temp');
const router = express.Router();

/**
 * GET /temps => {weatherData: [{id, cityName, currTempCel, currTempFar, minTempCel, maxTempCel, minTempFar, maxTempFar, airQuality}, ...]}
 * 
 */
router.get('/', async (req, res, next) => {
    try {
        const weatherData = await TempData.getTemps();
        return res.json({ weatherData })
    } catch (err) {
        return next(err);
    }
})

module.exports = router;