import * as Koa from 'koa';
import * as Router from "koa-router";
import * as WebSocket from 'ws';

let app = new Koa();
const router = new Router();
const WebSocketServer = WebSocket.Server;

const wss = new WebSocketServer({ server: app.listen(3031) });

router.get('/api/nodes', async (ctx) => ctx.body = "xx")

wss.on('connection', (ws) => {
  ws.url
  ws.upgradeReq.url
  console.info("url: " + ws.upgradeReq.url)
  ws.on('message', (message) => {
    console.log('received: %s', message)
    ws.send('something');
  })
});

app.use(router.routes())
app.use(router.allowedMethods());

