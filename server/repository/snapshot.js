'use strict';

const _ = require('lodash'),
    logger = require('../utils/logger'),
    moment = require('moment'),
    IndegoSnapshot = require('../utils/mongoDB').getModel('BixieIndegoSnapshot');

/**
 * Helper function that generate day by day range.
 * @param {string} startDate - First day.
 * @param {string} endDate - Last day
 * @returns {[{moment}]} Array of days at 12:00 noon.
 */
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

    /**
     * Search snapshot between two date
     * @param {Date} from - First day.
     * @param {Date} to - Last day
     * @param {Number} kioskId - Kiosk ID
     * @param {('daily' | 'hourly')} frequency - Aggregate output
     * @param {(1|-1)} sort - Sort
     * @returns {Promise<[{
     *       at : string,
     *       station: {},
     *       weather: {}
     * }]>}
     */
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

    /**
     *
     * @param {string} at Date
     * @return {Promise<{
     *       at : string,
     *       stations: {},
     *       weather: {}
     * }|null>}
     */
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

    /**
     *
     * @param {Date} at Date
     * @return {Promise<{
     *       at : string,
     *       stations: {},
     *       weather: {}
     * }|null>}
     */
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
