// import {executeNodeCheck} from "../src/report";
// executeNodeCheck().then(console.info).catch(err=>console.info(err + " xx"))

var CronJob = require('cron').CronJob;
new CronJob('0 * * * * *', function() {
  console.log('You will see this message every second');
}, null, true, 'America/Los_Angeles');