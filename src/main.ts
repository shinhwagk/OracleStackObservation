const koa = require('koa');
const router = require('koa-router');
const app = new koa();
const api = new router();
import * as axios from 'axios';

api
  .get("/v1/api/nodes", async (ctx) => {
    let nb
    try {
      nb = await axios.get("http://xxxx.comx.x.x").then(x => ctx.body = x.status)
    } catch (e) {
      console.info("1111111111111")
    }
    ctx.body = nb
    // .catch(e => console.info(e))
  })

app.use(api.routes()).use(api.allowedMethods());

app.listen(3000);

function abc() {
  if (Math.ceil(Math.random() * 3) === 1) {
    return "a"
  } else {
    throw 123;
  }
}