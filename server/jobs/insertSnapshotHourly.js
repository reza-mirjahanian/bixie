'use strict';

const logger = require('../utils/logger'),
    OpenWether = require('../repository/open-wether'),
    SnapShot = require('../repository/snapshot'),
    Indego = require('../repository/indego'),
    moment = require('moment');

class InsertSnapshotHourly {


    static async run() {

        const currentHour = moment.utc().startOf('hour');
        try {
            const record = await SnapShot.findOne(currentHour);
            if (!record) {
                const stations = await Indego.fetchLatestData();
                const weather = await OpenWether.fetchLatestData();
                await SnapShot.insert(currentHour, stations, weather);
            }

        } catch (e) {
            logger.error("InsertSnapshotHourly:run()", e);
            throw e;
        }


    }


}

module.exports = InsertSnapshotHourly;
