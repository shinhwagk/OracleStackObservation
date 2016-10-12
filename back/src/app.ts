import * as Koa from 'koa';
import * as Router from "koa-router";
import * as db from './db'
import * as conf from './conf'
import * as md_store from './store'
import * as md_monitor from './monitor/monitor'
const app = new Koa();

// async function b(fx) {
// 	fx.body =  "hellworkd";
// }

md_monitor.start()


const router = new Router();
router.get('/api/nodes', async (ctx) => {
	ctx.body = JSON.stringify(Array.from(md_store.nodePing))
});
// router.get('/api/nodes', b);
// app.use(db.text);
app.use(router.routes()).use(router.allowedMethods());

app.listen(3031);