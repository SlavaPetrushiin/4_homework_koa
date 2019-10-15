const Router = require('koa-router');
const router = new Router();
const koaBody = require('koa-body');
const multer  = require("multer");
const ENGINE = global.ENGINE;

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
	console.log(1111)
	ENGINE.emit('pages/home', ctx.request)
		.then( data => {
			console.log(3333333)
			let {products, skills, social} = data;
			//let msgsemail = req.flash('msgsemail')[0] || null;
			console.log(555)
			ctx.render('pages/index', { 
				products,
				skills,
				social,
				msgsemail
			});			
		})
		.catch(error => ctx.render('error', {message: error.message}))
});

router.post('/', function(req, res, next) {
	ENGINE.emit('post/message', req.body)
		.then(data => {
			req.flash('msgsemail', data.msgsemail)
			res.redirect('/');
		})
		.catch(error => res.render('error', {message: error.message}))
});

//администрирование
router.get('/admin', function(req, res, next) {
	let msgskill = req.flash('msgskill')[0] || null;
	let msgfile = req.flash('msgfile')[0] || null;
  res.render('pages/admin.pug', {msgskill, msgfile});
});

//Загрузка фотографии
router.post('/admin/upload', upload.single('photo'), function(req, res, next) {
	ENGINE.emit('/admin/upload', req)
		.then(data => {
			req.flash('msgfile', data.msgfile);
			res.redirect('/admin');
		})
		.catch(error => res.render('error', {message: error.message}))
});

//Загрузка скилов
router.post('/admin/skills', function(req, res, next) {
	ENGINE.emit('/admin/skills', req.body)
		.then(data => {
			req.flash('msgskill', data.msgskill);
			res.redirect('/admin');
		})
		.catch(error => res.render('error', {message: error.message}))
});

//логирование
router.get('/login', function(req, res, next) {
	ENGINE.emit('login/social', req)
		.then(data => {
			let social = data;
			let msglogin = req.flash('msglogin')[0] || null;
			res.render('pages/login.pug', { social, msglogin });
		})
		.catch(error => res.render('error', {message: error.message}))
});

router.post('/login', function(req, res, next) {
	ENGINE.emit('login/authorization', req.body)
		.then(data => {
			if(data === "/admin"){
				res.redirect(data);
			} else {
				req.flash('msglogin', data.msglogin);
				res.redirect('/login');
			}
		})
		.catch(error => res.render('error', {message: error.message}))
});

module.exports = router;