const ee = require('@nauma/eventemitter');
const DATABASE = new ee.EventEmitter('database');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
 
const adapter = new FileSync('db.json');
const db = low(adapter);

global.DATABASE = DATABASE;

DATABASE.on('pages/home', response => {
	let products = db.get('products').value();
	let skills = db.get('skills').value();
	let social = db.get('social').value();
	response.reply({products, skills, social});	
})

DATABASE.on('login/social', response => {
	let social = db.get('social').value();
	response.reply(social);	
})

DATABASE.on('login/authorization', response => {
	const {	email, password } = response.data;
	const administrator = db.get("administrator").value();
	const adminEmail = administrator.email;
	const adminPassword = administrator.password;
	
	if(email === adminEmail && password === adminPassword){
		response.reply(true);
	} else {
		response.reply(false);
	}
});

DATABASE.on('/admin/skills', response => {
	let numbers = []; //массив для данных пользователя
	for (let key in response.data){
		numbers.push(response.data[key])
	}
	let skills = db.get('skills').value();
	skills.forEach((item, index) => {
		item.number = numbers[index]
	});
	db.unset('skills')
		.write();
	db.set('skills', skills)
		.write()
	response.reply({msgskill : "Данные сохранены!"})				
});

DATABASE.on('/admin/upload', response => {
	let file = response.data;
	db.get('products')
		.push({
      "src": `./images/products/${file.originalname}`,
      "name": file.userName,
      "price": file.userPrice			
		})
		.write()
		response.reply({msgfile : "Данные сохранены!"})
});