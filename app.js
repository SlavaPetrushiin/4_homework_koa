const session = require('koa-generic-session');
const Koa = require('koa');
const app = new Koa();
const static = require('koa-static');
const flash = require('koa-connect-flash');
const path = require('path');
const koaBody = require('koa-body');
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

app.keys = ['keys'];
app.use(session(config.session, app));
app.use(flash());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => {
	console.log('Server running on https://localhost:3000');
});
