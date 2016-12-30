import * as cron from 'cron';
import { alertOSDisk } from './alert'

new cron.CronJob('0 0 */1 * * *', () => alertOSDisk(), null, true)