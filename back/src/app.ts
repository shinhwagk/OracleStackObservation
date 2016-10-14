// import * as Koa from 'koa';
// import * as Router from "koa-router";
// import * as db from './db'
// import * as conf from './conf'
import * as md_store from './store'
import * as md_monitor from './monitor/monitor'
// var websockify = require('koa-websocket');

md_monitor.start()

// const app = new Koa();
// var socket = websockify(app);
// const router = new Router();
// const api = new Router();
// router
// 	.get('/api/nodes', async (ctx) => ctx.body = JSON.stringify(Array.from(md_store.nodePing)))
// 	.get('/api/nodes2', async (ctx) => ctx.body = JSON.stringify(Array.from(md_store.nodePing)))


// api.get('/aa', (ctx) => {
// 	ctx.websocket.send('Hello World');
// 	ctx.websocket.on('message', function (message) {
// 		console.log(message);
// 	});
// });

// app.use(router.routes())
// app.use(router.allowedMethods());

// app.listen(3031);


// import * as Koa from 'koa';
// import * as Router from "koa-router";
// const app = new Koa();
// const router = new Router();
// router.get("/a", async (ctx) => ctx.body = "aaa")
// app.use(router.routes())
// app.use(router.allowedMethods());
// app.listen(3031);

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

apiSocket.get("/bb", (ctx) =>
	ctx.body = JSON.stringify(Array.from(md_store.nodePing))
)

app.use(apiSocket.routes()).use(apiSocket.allowedMethods());
app.ws.use(api.routes()).use(api.allowedMethods());
app.listen(3000);