'use strict';
const CITY = process.env.API_KEY_OPEN_WEATHER_MAP_CITY || 'Philadelphia';
const API_KEY = process.env.API_KEY_OPEN_WEATHER_MAP || '';//@todo remove me;

const
    isDevMode = process.env.NODE_ENV !== 'production',
    isTestMode = process.env.NODE_ENV === 'test',
    localUri = 'mongodb://localhost:27017/';

const constants = {
    EXPRESS_PORT: Number(process.env.PORT) || 3100,
    API: {
        INDEGO: {
            QUERY_INDEGO_URL: process.env.API_INDEGO_QUERY_INDEGO_URL || 'https://kiosks.bicycletransit.workers.dev/phl',

        },
        OPEN_WEATHER_MAP: {
            CITY,
            API_KEY,
            QUERY_OPEN_WEATHER_MAP_URL: process.env.API_QUERY_OPEN_WEATHER_MAP_URL || `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}`,
        }
    },
    MONGODB:{
        connections: {
            default: {
                uri: process.env.BIXIE_MONGO_DB_URI || localUri + `bixie${isTestMode ? '_test' : (isDevMode ? '_dev' : '')}`
            }
        }
    },
    SCHEDULER_CRON_MONITOR_INTERVAL: process.env.SCHEDULER_CRON_MONITOR_INTERVAL ||  '*/15 * * * *'

};
module.exports = constants;
