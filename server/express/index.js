'use strict';
const express = require('express'),
    constants = require('../constants'),
    cors = require('cors'),
    moment = require('moment'),
    _ = require('lodash'),
    SnapshotRepo = require('../repository/snapshot'),
    logger = require('../utils/logger');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('Server is running'));

//Snapshot of all stations at a specified time
app.get('/api/v1/stations', async (req, res) => {
    try {
        const {at} = req.query;
        const data = await SnapshotRepo.findFirstAfter({at});
        if (data) {
            return res.status(200).send(data);
        }
        res.status(404).send("Error");

    } catch (err) {
        logger.error('/api/v1/stations', {
            err
        });
        res.status(500).send("Error");
    }
});

//Snapshot of one station at a specific time [at]
//Snapshots of one station over a range of times [from,to,frequency ]
app.get('/api/v1/stations/:kioskId', async (req, res) => {
    try {
        const {at, from, to, frequency = 'hourly'} = req.query;
        const kioskId = _.toNumber(_.get(req, 'params.kioskId'));
        if (kioskId > 0) {
            if (at) {
                const data = await SnapshotRepo.findFirstAfter({at});
                const station = _.find(_.get(data, 'stations', []), item => _.get(item, 'properties.id') === kioskId);
                const weather = _.get(data, 'weather', {});
                if (weather && station) {
                    return res.status(200).send({
                        at,
                        station,
                        weather
                    });
                }
            }
            if (from && to && moment(to).isValid() && moment(from).isValid()) {
                const searchFrom = moment.utc(from);
                const searchTo = moment.utc(to);
                const searchFrequency = (frequency === 'hourly') ? 'hourly' : 'daily';
                const stations = await SnapshotRepo.findInRange({
                    from: searchFrom,
                    to: searchTo,
                    kioskId,
                    frequency: searchFrequency
                });
                return res.status(200).send(stations);
            }

        }

        res.status(404).send("Error");

    } catch (err) {
        logger.error('/api/v1/stations/:kioskId', {
            err
        });
        res.status(500).send("Error");
    }
});


app.listen(constants.EXPRESS_PORT, () => logger.log(`listening on port ${constants.EXPRESS_PORT}!`));
