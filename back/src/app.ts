import * as md_store from "./store";
import { apiNodes } from "./api";
import * as md_monitor from "./report";
import { getOracleAlertQueue, getOSReportQueue, execOracleAlert,  getOracleReportQueue } from "./alert";
import { genPidFile } from "./common";
import { createLogFolderIfNotExist } from "./logger";

genPidFile()
createLogFolderIfNotExist()
execOracleAlert()

const koa = require('koa');
// const websockify = require('koa-websocket');
const router = require('koa-router');

const app = new koa();
const api = new router();
// const apiSocket = new router()

// websockify(app);

// apiSocket.get('/api/', (ctx) => {
//   ctx.websocket.send('Hello World');
//   ctx.websocket.on('message', (message) => console.log(message));
// })

api
  .get("/api/nodes", apiNodes)
  .get("/api/node/oracle/alerts", (ctx) => {
    ctx.type = 'application/json';
    ctx.body = JSON.stringify(md_store.AlertOracleDB);
  })
  .get("/api/report/oracle/names/:ip/:service", async (ctx) => {
    const ip = ctx.params.ip
    const service = ctx.params.service
    console.info(ip, service)
    const b = await getOracleReportQueue(ip, service)
    ctx.body = JSON.stringify(b)
  })
  // .get("/api/alert/oracle/names/:ip/:service", async (ctx) => {
  //   const ip = ctx.params.ip
  //   const service = ctx.params.service
  //   console.info(ip, service)
  //   const b = await getOracleAlertNames(ip, service)
  //   ctx.body = JSON.stringify(b)
  // })
  .get("/api/report/os/names/:ip", async (ctx) => {
    const ip = ctx.params.ip
    const b = await getOSReportQueue(ip)
    ctx.body = JSON.stringify(b)
  })
  .get("/api/report/oracle/:ip/:service/:name", md_monitor.reportOracleMonitorByName)
  .get("/api/alert/oracle/:ip/:service/:name", md_monitor.alertOracleMonitorByName)
  .get("/api/report/os/:ip/:name", md_monitor.reportOSMonitorByName)

app.use(api.routes()).use(api.allowedMethods());
// app.ws.use(apiSocket.routes()).use(apiSocket.allowedMethods());

app.listen(3000);