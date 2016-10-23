const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const path = require('path');
const api = express.Router();
const mongoose = require('mongoose');
const dbURI = 'mongodb://localhost/comisaria';
const Denuncia = require('./models/denuncia');
const Usuario = require('./models/usuario');
const _server = server.listen(3000, function () {
	console.log("Listen on port 3000");
});

const io = require('socket.io')(_server);

require('./sockets')(io);

server.use(express.static(path.join(__dirname, 'public')));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'jade');

mongoose.connect(dbURI);

mongoose.connection.on('connected', function () {
	console.log("Connected");
});

api.post('/complaint', function _complaint(req, res) {
	var denuncia = new Denuncia(req.body);
	denuncia
	.save()
	.then(function (denuncia) {
		res.json({
			success: true,
			denuncia: denuncia
		});
	})
	.catch(function (error) {
		res.json({
			success: false,
			error: error
		})
	});
});

api.get('/complaint', function _complaint(req, res) {
	Denuncia.find().exec(function (error, data) {
		if(error) {
			res.json({error: error});
		}
		res.json({
			denuncias: data
		})
	});
});

server.get('/', function index(req, res) {
	res.redirect('/user');
});

server.get('/admin', function admin(req, res) {
	Denuncia.find().exec(function (error, data) {
		res.render('admin', {
			denuncias: data,
			user: "alfonso"
		});
	});
});

server.get('/user/chat', function chat(req, res) {
	res.render('chat');
});

server.get('/user', function user(req, res){
	res.render('index');
});

server.get('/user/notifier', function notifier(req, res) {
	res.render('notifier');
});
server.use('/api', api);
