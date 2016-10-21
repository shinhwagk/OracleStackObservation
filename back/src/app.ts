import * as md_store from "./store";
import * as md_monitor from "./monitor";
import {getOracleReportQueue} from "./alert";

md_monitor.start()

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

api.get("/bb", (ctx) => {
  ctx.type = 'application/json';
  ctx.body = JSON.stringify(md_store.getNodeInfo)
}).get("/api/nodes", md_store.getNodeInfo)
  .get("/api/node/:ip", md_monitor.abc)
  .get("/api/node/:ip/:service", md_monitor.abc)
  .get("/api/node/:ip/:service/:name", (ctx) => ctx.body = "!1")
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
  .get("/api/report/oracle/:name/:ip/:service", async(ctx)=> {
    ctx.body = "xxx"
  })

app.use(api.routes()).use(api.allowedMethods());
app.ws.use(apiSocket.routes()).use(apiSocket.allowedMethods());

app.listen(3000);