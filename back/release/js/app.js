import * as md_store from './store';
import * as md_monitor from './monitor/monitor';
md_monitor.start();
const koa = require('koa');
const websockify = require('koa-websocket');
const router = require('koa-router');
const app = new koa();
const api = new router();
const apiSocket = new router();
websockify(app);
apiSocket.get('/api/', (ctx) => {
    ctx.websocket.send('Hello World');
    ctx.websocket.on('message', (message) => console.log(message));
});
api
    .get("/bb", (ctx) => {
    ctx.type = 'application/json';
    ctx.body = JSON.stringify(md_store.nodesff());
})
    .get("/api/nodes", (ctx) => {
    ctx.body = JSON.stringify(md_store.NcDB);
});
app.use(api.routes()).use(api.allowedMethods());
app.ws.use(apiSocket.routes()).use(apiSocket.allowedMethods());
app.listen(3000);
