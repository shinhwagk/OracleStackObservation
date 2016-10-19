import * as monitor from '../src/monitor'
import { DatabaseConnectInfo } from '../src/db'

// monitor.executeCheckCommand({ args: ["127.0.0.1","80"] }, monitor.ncCheckCommand).then(console.info)
monitor.monitorStart().then(f=>console.info(JSON.stringify(f))).catch(console.info)