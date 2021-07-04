const CronJob = require('cron').CronJob

module.exports = (jobName) => {
    return new CronJob('0 0 */1 * * *', jobName, null, false, 'Asia/Ho_Chi_Minh')
}
