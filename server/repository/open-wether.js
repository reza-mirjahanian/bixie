'use strict';

const _ = require('lodash'),
    axios = require('axios'),
    logger = require('../utils/logger'),
    constants = require('../constants');


module.exports = {
    fetchLatestData: async () => {
        try {
            const {data} = await axios.get(constants.API.OPEN_WEATHER_MAP.QUERY_OPEN_WEATHER_MAP_URL);
            if (_.has(data, 'weather')) {
                return data
            } else {
                throw new Error("OpenWeatherMapRepository:fetchLatestData() has empty data!");
            }

        } catch (e) {
            logger.error("OpenWeatherMapRepository:fetchLatestData()", e);
            return [];
        }
    }
};
