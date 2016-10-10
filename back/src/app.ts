import * as Koa from 'koa';
import * as Router from "koa-router";
import * as db from './db'

const app = new Koa();

async function b(fx) {
	fx.body = await "hellworkd";
}
const router = new Router();
router.get('/user', db.text);
// app.use(db.text);
app.use(router.routes()).use(router.allowedMethods());

app.listen(3031);