import * as md_store from "./store";
import {getAllNodeInfo} from "./store";
import * as md_monitor from "./report";
import {getOracleReportQueue, getOSReportQueue} from "./alert";
import {executeCheckCommand} from "./report";
import {pingCheckCommand} from "./report";
import {ncCheckCommand} from "./report";
import {getAllNodeBaseInfo} from "./store";

// md_monitor.startCheck()

const koa = require('koa');
const websockify = require('koa-websocket');
const router = require('koa-router');

const app = new koa();
const api = new router();
const apiSocket = new router()

websockify(app);

apiSocket.get('/api/', (ctx) => {
  ctx.websocket.send('Hello World');
  ctx.websocket.on('message', (message) => console.log(message));
})

api
  .get("/api/nodes", getAllNodeInfo)
  .get("/api/node/oracle/alerts", (ctx) => {
    ctx.type = 'application/json';
    ctx.body = JSON.stringify(md_store.AlertOracleDB);
  })
  .get("/api/report/oracle/names/:ip/:service", async(ctx)=> {
    const ip = ctx.params.ip
    const service = ctx.params.service
    console.info(ip, service)
    const b = await getOracleReportQueue(ip, service)
    ctx.body = JSON.stringify(b)
  })
  .get("/api/report/os/names/:ip", async(ctx)=> {
    const ip = ctx.params.ip
    const b = await getOSReportQueue(ip)
    ctx.body = JSON.stringify(b)
  })
  .get("/api/report/oracle/:ip/:service/:name", md_monitor.reportOracleMonitorByName)
  .get("/api/report/os/:ip/:name", md_monitor.reportOSMonitorByName)

app.use(api.routes()).use(api.allowedMethods());
app.ws.use(apiSocket.routes()).use(apiSocket.allowedMethods());

app.listen(3000);

