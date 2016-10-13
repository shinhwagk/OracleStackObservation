import * as Koa from 'koa';
import * as Router from "koa-router";
import * as db from './db'
import * as conf from './conf'
import * as md_store from './store'
import * as md_monitor from './monitor/monitor'

md_monitor.start()

const app = new Koa();

const router = new Router();

router
	.get('/api/nodes', async (ctx) => ctx.body = JSON.stringify(Array.from(md_store.nodePing)))
	.get('/api/nodes2', async (ctx) => ctx.body = JSON.stringify(Array.from(md_store.nodePing)))

app.use(router.routes())
app.use(router.allowedMethods());

app.listen(3031);
