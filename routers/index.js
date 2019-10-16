const Router = require('koa-router');
const router = new Router();
const koaBody = require('koa-body');
const ENGINE = global.ENGINE;
const multer = require('@koa/multer');

const storage = multer.diskStorage({
	destination : ( req, file, cb ) =>{
		cb(null, "public/images/products");
	},
	filename: (req, file, cb) =>{
		cb(null, file.originalname);
	}	
});

const upload = multer({
	storage : storage,
	limits: {fieldSize: 2 * 1024 * 1024},
});

/* GET home page. */
router.get('/', async (ctx) =>  {
	await ENGINE.emit('pages/home', ctx.request)
		.then( async data => {
			let {products, skills, social} = data;
			let msgsemail = ctx.flash('msgsemail')[0] || null;
			await ctx.render('pages/index', { 
				products,
				skills,
				social,
				msgsemail
			});			
		})
		.catch(async error => await ctx.render('error', {message: error.message}))
});

router.post('/', async (ctx) => {
	await ENGINE.emit('post/message', ctx.request.body)
		.then(async data => {
			ctx.flash('msgsemail', data.msgsemail)
			await ctx.redirect('/');
		})
		.catch(async error => await ctx.render('error', {message: error.message}))
});

//администрирование
router.get('/admin', async (ctx) => {
	let msgskill = ctx.flash('msgskill')[0] || null;
	let msgfile = ctx.flash('msgfile')[0] || null;
  await ctx.render('pages/admin.pug', {msgskill, msgfile});
});

//Загрузка фотографии
router.post('/admin/upload', upload.single('photo'), async (ctx) => {
	await ENGINE.emit('/admin/upload', ctx.request)
		.then(async data => {
			ctx.flash('msgfile', data.msgfile);
			await ctx.redirect('/admin');
		})
		.catch(async error => await ctx.render('error', {message: error.message}))
});

//Загрузка скилов
router.post('/admin/skills', async (ctx) => {
	await ENGINE.emit('/admin/skills', ctx.request.body)
		.then(async data => {
			ctx.flash('msgskill', data.msgskill);
			await ctx.redirect('/admin');
		})
		.catch(async error => await ctx.render('error', {message: error.message}));
});

//логирование
router.get('/login', async (ctx) => {
	await ENGINE.emit('login/social', ctx.request)
		.then(async data => {
			let social = data;
			let msglogin = ctx.flash('msglogin')[0] || null;
			await ctx.render('pages/login.pug', { social, msglogin });
		})
		.catch(async error => await ctx.render('error', {message: error.message}))
});

router.post('/login', async (ctx) => {
	await ENGINE.emit('login/authorization', ctx.request.body)
		.then(async data => {
			if(data === "/admin"){
				await ctx.redirect(data);
			} else {
				ctx.flash('msglogin', data.msglogin);
				await ctx.redirect('/login');
			}
		})
		.catch(async error => await res.render('error', {message: error.message}))
});

module.exports = router;