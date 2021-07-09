const
    constants = require('../constants'),
    logger = require('../utils/logger'),
    CronJob = require('cron').CronJob,
    insertSnapshotHourly = require('./insertSnapshotHourly');


const cronInterval = constants.SCHEDULER_CRON_MONITOR_INTERVAL;
const jobs = [];
jobs.push(insertSnapshotHourly);


module.exports = () => {
    try {

        new CronJob(
            cronInterval,
            async () => {
                for (let job of jobs) {
                    try {
                        await  job.run();
                    } catch (e) {
                        logger.error('running job', {
                            e
                        });
                    }
                }

            },
            null,
            true,
            'Asia/Tehran'
        );

    } catch (e) {
        logger.error('error on scheduler.js', {
            e
        });
    }


};
