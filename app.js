const session = require('koa-session');
const Koa = require('koa');
const app = new Koa();
const static = require('koa-static');
const path = require('path');
const koaBody = require('koa-body');
const flash = require('connect-flash');
const config = require('./config');

const Pug = require('koa-pug') ;
const pug = new Pug({
  viewPath: path.resolve(__dirname, './views'),
  pretty: false,
  basedir: './views',
  noCache: true,
  app: app, // equals to pug.use(app) and app.use(pug.middleware)
});

require('./database');
require('./engine');

const router = require('./routers');

app.use(static('./public'));
app.use(koaBody());
app.use(session(config.session, app))
app.use(router.routes())
app.use(router.allowedMethods());
app.use(flash());


app.listen(3000, () => {
	console.log('Server running on https://localhost:3000');
})
