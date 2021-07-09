'use strict';

const _ = require('lodash'),
    axios = require('axios'),
    logger = require('../utils/logger'),
    constants = require('../constants');

module.exports = {
    fetchLatestData: async () => {
        try {
            const {data} = await axios.get(constants.API.INDEGO.QUERY_INDEGO_URL);
            const items = _.get(data, 'features', []);
            if (_.isArray(items)) {
                return items
            } else {
                throw new Error("IndegoRepository:fetchLatestData() has empty data!");
            }

        } catch (e) {
            logger.error("IndegoRepository:fetchLatestData()", e);
            return [];
        }
    }
};
