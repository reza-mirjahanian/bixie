'use strict';

const _ = require('lodash'),
    logger = require('../utils/logger'),
    moment = require('moment'),
    IndegoSnapshot = require('../utils/mongoDB').getModel('BixieIndegoSnapshot');

const _generateDateRange = (startDate, endDate) => {
    const today = moment(endDate);
    const from = moment(startDate);
    const rangeArray = [];
    for (from; from.isSameOrBefore(today); from.add(1, 'days')) {
        rangeArray.push(from.clone().utc().hour(12));
    }
    return rangeArray;
};

class Snapshot {

    static async findInRange({from, to, sort = 1, kioskId, frequency}) {
        try {

            if (frequency === 'hourly') {
                const dataInRange = await IndegoSnapshot.find({
                    at: {$gte: from, $lte: to}
                }).sort({
                    at: sort
                }).lean();

                return _.map(dataInRange, (data) => {
                    const station = _.find(_.get(data, 'stations', []), o => _.get(o, 'properties.id') === kioskId);
                    return {
                        at: moment(_.get(data, 'at', "")).utc().format('YYYY-MM-DDTHH:00:00'),
                        station,
                        weather: _.get(data, 'weather', {})
                    }
                });
            }
            if (frequency === 'daily') {
                const dataInRange = await IndegoSnapshot.find({
                    at: {$gte: from.startOf('day'), $lte: to.endOf('day')}
                }).sort({
                    at: sort
                }).lean();
                const dailyRange = _generateDateRange(from, to);
                const output = [];
                dailyRange.forEach((day) => {
                    const dayData = _.find(dataInRange, o => {
                        let recordDate = moment(o.at).utc();
                        return recordDate.isSame(day, 'day') && recordDate.isSameOrAfter(day);
                    });
                    if (dayData) {
                        const station = _.find(_.get(dayData, 'stations', []), o => _.get(o, 'properties.id') === kioskId);
                        output.push({
                            day,
                            at: moment(_.get(dayData, 'at', "")).utc().format('YYYY-MM-DDTHH:00:00'),
                            station,
                            weather: _.get(dayData, 'weather', {})
                        })
                    }
                });

                return output;
            }


        } catch (e) {
            logger.error("Snapshot:findOne()", e);
            return null;
        }
    }

    static async findAt({at}) {
        try {
            if (!at || !moment(at).isValid()) {
                return null;
            }
            const searchTime = moment.utc(at);
            return await IndegoSnapshot.findOne({
                at: searchTime
            }).lean();

        } catch (e) {
            logger.error("Snapshot:findOne()", e);
            return null;
        }
    }

    static async insert(date, stations = [], weather = {}) {
        try {
            await IndegoSnapshot.create({
                at: date,
                stations,
                weather
            });
            logger.log("New snapshot is inserted at: " + new Date());
            return true;

        } catch (e) {
            logger.error("Snapshot:insert()", e);
            return false;
        }
    }


    static async findOne(at) {
        try {
            return await IndegoSnapshot.findOne({
                at
            }).lean();

        } catch (e) {
            logger.error("Snapshot:findOne()", e);
            return null;
        }
    }


}

module.exports = Snapshot;
