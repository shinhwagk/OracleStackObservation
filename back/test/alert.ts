import { getOracleAlertQueue, execOracleAlert, AlertDB } from '../src/alert';

// getOracleAlertQueue().then(p => console.info(p))

execOracleAlert()
setInterval(()=>console.info(AlertDB),3000)