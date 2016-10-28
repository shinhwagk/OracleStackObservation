var CronJob = require('cron').CronJob;

var c = new CronJob('*/2 * * * * *', function() {
  console.log('You will see this message every second');
}, null, true, 'America/Los_Angeles');

setTimeout(()=>c.stop(),5000)