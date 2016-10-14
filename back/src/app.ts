import * as md_store from './store'
import * as md_monitor from './monitor/monitor'

md_monitor.start()

const koa = require('koa');
const websockify = require('koa-websocket');
const router = require('koa-router');

const app = new koa();
const api = new router();
const apiSocket = new router()

websockify(app);

api.get('/aa', (ctx) => {
	ctx.websocket.send('Hello World');
	ctx.websocket.on('message', function (message) {
		console.log(message);
	});
});

apiSocket
	.get("/bb", (ctx) => {
		ctx.type = 'application/json';
		ctx.body = JSON.stringify(Array.from(md_store.nodeCheck))
	})
	.get("/cc", (ctx) => ctx.body = JSON.stringify(Array.from(md_store.portNC)))

app.use(apiSocket.routes()).use(apiSocket.allowedMethods());
app.ws.use(api.routes()).use(api.allowedMethods());
app.listen(3000);