const ee = require('@nauma/eventemitter');
const ENGINE = new ee.EventEmitter('engine');
const joi = require('@hapi/joi');
global.ENGINE = ENGINE;

ENGINE.on('pages/home', response => {
	DATABASE.emit('pages/home', response.data)
		.then(data => {response.reply(data)})
		.catch(_ => response.replyErr({ message: 'Какая та ошибка!' }));
})

ENGINE.on('post/message', response => {
	const {	name, email, message } = response.data;

	const schema = joi.object().keys({
		name: joi.string().min(3).max(30).required(),
		email: joi.string().email().required(),
		message: joi.string().min(2).max(3000).required()
	})

	const result = schema.validate(response.data);
	const {value, error} = result;
	const valid = error == undefined;
	if(!valid){
		response.reply( {msgsemail : "Заполните все поля для отправки сообщения!"} );
	} else {
		response.reply( {msgsemail : "Сообщение доставлено!"} )
	}
})

ENGINE.on('login/social', response => {
	DATABASE.emit('login/social', response.data)
		.then(data => {response.reply(data)})
		.catch(_ => response.replyErr({ message: 'Какая та ошибка!' }));	
})

ENGINE.on('login/authorization', response => {
	console.log(11111)
	const {	email, passowrd } = response.data;
	const schema = joi.object().keys({
		email: joi.string().email().required(),
		password : joi.string().min(7).alphanum().required()
	})

	const result = schema.validate(response.data);
	const {value, error} = result;
	const valid = error == undefined;
	if(!valid){
		response.reply( {msglogin: 'Поля заполнены не верно!'} );
	} else {
		DATABASE.emit('login/authorization', response.data)
		.then((data) => {
			if (data){
				response.reply('/admin')
			} else {
				response.reply({msglogin : "Почта или прароль не совпадают! Повторите попытку!"})
			}
		})
		.catch(_ => response.replyErr({ message: 'Какая та ошибка!' }));
	}
})

ENGINE.on('/admin/skills', response => {
	let {age, concerts, cities, years} = response.data;
	if (age.length !== 0 && concerts.length !== 0 && cities.length !== 0 && years.length !== 0){
		DATABASE.emit('/admin/skills', response.data)
    	.then(data => response.reply(data))
    	.catch(_ => response.replyErr({ message: 'Ошибка ' }))
	} else {
		response.reply({msgskill : "Заполните все поля"})
	}
})

ENGINE.on('/admin/upload', response => {
	let { name, price } = response.data.body;
	let userFile = response.data.files;
	if (name.length !== 0 && price.length !== 0){
		userFile.userName = name;
		userFile.userPrice = price;
		DATABASE.emit('/admin/upload', userFile)
			.then(data => response.reply(data))
			.catch(_ => response.replyErr({ message: 'Ошибка ' }))
	} else {
		response.reply({msgfile : "Заполните все поля"})
	}
})