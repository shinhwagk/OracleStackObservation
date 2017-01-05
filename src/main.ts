const koa = require('koa');
const router = require('koa-router');

const app = new koa();
const api = new router();

api
  .get("/v1/nodes", async (ctx) => { })
  .get("/v1/nodes/:ip")
  .get("/v1/nodes/:ip/os")
  .get("/v1/nodes/:ip/dbs/oracle")
  .get("/v1/nodes/:ip/dbs/oracle/:service")
  .get("/v1/os/:ip/:name")
  .post("/v1/db/:type/:name")


app.use(api.routes()).use(api.allowedMethods());
app.listen(3000);