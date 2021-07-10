'use strict';
const chai = require('chai');
const moment = require('moment');
const snapshotRepo = require('../../server/repository/snapshot');
const constants = require('../../server/constants');
const IndegoSnapshot = require('../../server/utils/mongoDB').getModel('BixieIndegoSnapshot');
chai.use(require('sinon-chai'));
chai.should();
require('../../server/express'); //@todo maybe cleanup
const axios = require('axios');


describe('Testing Express API routes', () => {
    beforeEach(async () => {
        await IndegoSnapshot.remove({});
    });
    describe('GET /', () => {
        it('should respond with "Server is running" ', async () => {
            const {data: response} = await axios.get(`http://localhost:${constants.EXPRESS_PORT}/`);
            response.should.to.equal("Server is running")
        });

    });

    describe('GET /api/v1/stations/', () => {

        it('should returns stations at specific time', async () => {
            const at = `2021-07-09T09:00:00`;
            await snapshotRepo.insert(moment.utc('2021-07-09T08:00:00'), [1, 2], {1: 2});
            await snapshotRepo.insert(moment.utc(at), [3, 4], {3: 4});
            await snapshotRepo.insert(moment.utc('2021-07-09T10:00:00'), [5, 6], {5: 6});
            const {data: response} = await axios.get(`http://localhost:${constants.EXPRESS_PORT}/api/v1/stations/?at=${at}`);
            response.should.be.deep.equal({at, stations: [3, 4], weather: {'3': 4}});

        });

        it('should returns 404 If no suitable data is available', async () => {
            const at = `2021-07-09T09:00:00`;
            const response = await axios.get(`http://localhost:${constants.EXPRESS_PORT}/api/v1/stations/?at=${at}`, {validateStatus: false});
            response.status.should.to.be.equal(404);

        });

    });

    describe('GET /api/v1/stations/:kioskId', () => {

        it('should returns 404 If no suitable data is available', async () => {
            const at = `2021-07-09T09:00:00`;
            const kioskId = 3004;
            await snapshotRepo.insert(moment.utc('2021-07-09T08:00:00'), [1, 2], {1: 2});
            const response = await axios.get(`http://localhost:${constants.EXPRESS_PORT}/api/v1/stations/${kioskId}?at=${at}`, {validateStatus: false});
            response.status.should.to.be.equal(404);
        });

        it('should returns response at specific time ', async () => {
            const at = `2021-07-09T09:00:00`;
            const kioskId = 3004;
            await snapshotRepo.insert(moment.utc('2021-07-09T07:00:00'), [{properties: {id: kioskId}}, 2], {});
            await snapshotRepo.insert(moment.utc(at), [{properties: {id: kioskId}}, 2], {target: true});
            await snapshotRepo.insert(moment.utc(at), [{properties: {id: kioskId + 1}}, 2], {});
            const {data: response} = await axios.get(`http://localhost:${constants.EXPRESS_PORT}/api/v1/stations/${kioskId}?at=${at}`);
            response.should.be.deep.equal({at, station: {properties: {id: kioskId}}, weather: {target: true}});
        });

        it('should returns response for one station over a range of times (Hourly) ', async () => {
            const from = `2021-07-09T09:00:00`;
            const to = `2021-07-09T10:00:00`;
            const kioskId = 3004;
            await snapshotRepo.insert(moment.utc('2021-07-09T07:00:00'), [{properties: {id: kioskId}}, 2], {});
            await snapshotRepo.insert(moment.utc(from), [{properties: {id: kioskId}}, 2], {});
            await snapshotRepo.insert(moment.utc(to), [{properties: {id: kioskId}}, 2], {});
            await snapshotRepo.insert(moment.utc(to), [{properties: {id: kioskId + 1}}, 2], {});
            await snapshotRepo.insert(moment.utc('2021-07-09T11:00:00'), [{properties: {id: kioskId }}, 2], {});
            const {data: response} = await axios.get(`http://localhost:${constants.EXPRESS_PORT}/api/v1/stations/${kioskId}?from=${from}&to=${to}`);
            (response.length).should.be.equal(2);
        });

    });


})
