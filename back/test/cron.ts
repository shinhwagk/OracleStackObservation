var CronJob = require('cron').CronJob;

var c = new CronJob('*/2 * * * * *', function() {
  console.log('You will see this message every second');
}, null, true, 'America/Los_Angeles');

console.info(c)
// var cnt = 0
// while(cnt <1000){
//   const bak = cnt
//   new CronJob('*/2 * * * * *', function() {
//     console.log(bak);
//   }, null, true, 'America/Los_Angeles');
//   cnt +=1
//   console.info("start " + cnt)
// }
// setTimeout(()=>c.stop(),5000)