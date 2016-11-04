const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const path = require('path');
const api = express.Router();
const mongoose = require('mongoose');
const cors = require('cors');
const autoIncrement = require('mongoose-auto-increment');
const https = require('https');
const dbURI = 'mongodb://localhost/comisaria';
const Denuncia = require('./models/denuncia');
const Usuario = require('./models/usuario');
const Message = require('./models/message');

const fs = require('fs');
const options = {
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem')
};

const httpsServer = https.createServer(options, server);

const _server = httpsServer.listen(443, function () {
	console.log("Listen on port 80");
});

const session = require('express-session');
const cookieParser = require('cookie-parser');
//const bcrypt = require('bcrypt');
const io = require('socket.io')(_server);
const auth = require('./auth/auth');


require('./sockets')(io);

server.use(express.static(path.join(__dirname, 'public')));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));
server.use(cookieParser());
server.use(session({
	secret: 'comisaria_secret',
	resave: false,
	saveUninitialized: true,
	cookie: {secure: true}
}));
server.use(cors());
server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'jade');

mongoose.Promise = global.Promise;
mongoose.connect(dbURI);

//autoIncrement.initialize(mongoose);

mongoose.connection.on('connected', function () {
	console.log("Conectado a MongoDB");
});

api.get('/user/:id', function getUser(req, res) {
	var id = req.params.id;
	Usuario.findOne({_id: id}, function (error, user) {
		res.json({user: user});
	});
});

api.post('/user', function postUser(req, res) {
	var user = new Usuario({
		role: "agent",
		name: req.body.name,
		lastname: req.body.lastname,
		state: 1,
		currentLocation: {},
		password: req.body.password,
		entry: req.body.entry
	});
	user.save(function (error, user){
		if(error) {
			return res.json({success: false});
		}
		return res.json({success: true,user: user});
	});
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

api.get('/logout', function logout(req, res) {
	res.clearCookie('id');
	res.clearCookie('role');
	res.clearCookie('user');
	res.send("Ok");
	//res.redirect('/login');
});

api.get('/authenticate/:user', function authenticate(req, res) {
	var params = JSON.parse(req.params.user);

	Usuario.findOne({name: params.user, password: params.password}, function (error, data) {
		if(error) {
			res.json({
				error: "error"
			});
		}
		else {
			res.cookie('id', data._id);
			res.cookie('role', data.role);
			res.cookie('user', data.name);
			res.json({
				success: true,
				user: data
			});
		}
	});
});

server.get('/admin/crimes', auth.authNoSession, function crimes(req, res) {
	Denuncia.find({}, function (error, data) {
		res.render('admin', {
			denuncias: data
		});
	});
});

/*var admin = new Usuario({
	role: "admin",
	name: "Kevin",
	lastname: "Galindo",
	state: 1,
	currentLocation: {
		latitude: 14.539786, 
		longitude: -91.678999
	},
	password: "kevin123",
	entry: '01/01/2014'
});*/

server.get('/admin/agents', auth.authNoSession, function agents(req, res) {
	Usuario.find({role: 'agent'}).exec(function (error, data) {	
		res.render('agents', {
			agents: data
		});
	});
});

server.get('/user/chat', auth.authNoSession, function chat(req, res) {
		res.render('chat');
});

server.get('/admin/chat', auth.authNoSession, function chatAdmin(req, res) {
	Usuario.find({role: 'agent'}).exec(function (error, data) {
		res.render('chat_admin', {
			agents: data
		});
	});
});

server.get('/user', auth.authNoSession, function user(req, res){
	res.render('index');
});

server.get('/login', auth.authUser, function login(req, res) {
	res.render('login');
});

server.get('/user/notifier', auth.authNoSession, function notifier(req, res) {
	res.render('notifier', {});
});
server.use('/api', api);
