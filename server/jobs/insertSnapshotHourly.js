'use strict';

const logger = require('../utils/logger'),
    OpenWether = require('../repository/open-wether'),
    SnapShot = require('../repository/snapshot'),
    Indego = require('../repository/indego'),
    moment = require('moment');

class InsertSnapshotHourly {


    static async run() {

        const currentHour = moment.utc().startOf('hour');
        logger.log("Job:InsertSnapshotHourly:run()", currentHour);
        try {
            const record = await SnapShot.findOne(currentHour);
            logger.log("Job:InsertSnapshotHourly:record: ", record);
            if (!record) {
                const stations = await Indego.fetchLatestData();
                const weather = await OpenWether.fetchLatestData();
                await SnapShot.insert(currentHour, stations, weather);
                logger.log("Job:InsertSnapshotHourly:finished :) ");
            }

        } catch (e) {
            logger.error("InsertSnapshotHourly:run()", e);
            throw e;
        }


    }


}

module.exports = InsertSnapshotHourly;
