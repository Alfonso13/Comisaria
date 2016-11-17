/*Requires*/
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
const async = require('async');

/*Models*/
const Usuario = require('./models/usuario');
const Vehicle = require('./models/vehicle');
const Theft = require('./models/theft');
const Alert = require('./models/general');
const Message = require('./models/message');

const fs = require('fs');
const options = {
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem')
};

const httpsServer = https.createServer(options, server);
const _server = httpsServer.listen(443, function () {
	console.log("Listen on port 443");
});

/*const _server = server.listen(3000, function () {
	console.log("Listen on port 3000");
});*/
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

api.delete('/user/:id', function deleteUser(req, res) {
	var id = req.params.id;
	Usuario.remove({_id: id}, function removeUser(error, data) {
		res.json({removed: true});
	});
});

api.get('/alerts', function alerts(req, res) {
	var vehicles = Vehicle.find({}).exec();
	//var thefts = Theft.find({state: 0}).exec();
	var data = {};
	vehicles
	.then(function (vehicles_thefts) {
		data.vehicles = vehicles_thefts; 
		return Theft.find({}).exec();
	})
	.then(function (thefts) {
		data.thefts = thefts;
		return Alert.find({}).exec();
	})
	.then(function (alerts) {
		data.alerts = alerts;
		res.json({
			data: data
		});
	})
	.catch(function (error) {
		res.json(error);
	});
});

/*Usuario.findOne({name: 'jairo'}, function (error, data) {var promise = Usuario.findOneAndUpdate({_id: data._id}, {$set: { currentLocation: {latitude: 14.548252, longitude: -91.663329}}}).exec(); promise .then(function (response) {console.log(response); }) .catch(function (error) {console.log(error);});});*/

api.put('/user/:id/location/:location', function putLocation(req, res){
	var location = JSON.parse(req.params.location);
	var id = req.params.id;
	var promise = Usuario.findOneAndUpdate({_id: id}, {$set: {currentLocation: {latitude: location.latitude, longitude: location.longitude}}}).exec();
	promise
	.then(function (response) {
		res.json({success: true})
	})
	.catch(function (error) {
		res.json({error: error})
	});
});

api.put('/user/:type/:id/state/:state', function putState(req, res) {	
	var id = req.params.id;
	var type = req.params.type;
	var state = req.params.state;
	var promise;
	if(type == 'theft') {
		promise = Theft.findOneAndUpdate({_id: id}, {$set: {state: state}}).exec();
		promise
		.then(function then(_theft) {
			res.json({success: true, theft: _theft});
		})
		.catch(function _catch(error) {
			res.json({success: false,error: error,theft: {}});
		});
	}

	if(type == 'theft_vehicle') {
		promise = Vehicle.findOneAndUpdate({_id: id}, {$set: {state: state}}).exec();
		promise
		.then(function then(_theft_vehicle) {
			res.json({
				success: true,
				theft: _theft_vehicle
			});
		})
		.catch(function _catch(error) {
			res.json({
				success: true,
				theft: {},
				error: error
			});
		});
	}

	if(type == 'general') {
		res.json({casual: "hola"})
	}
});

api.get('/policemen', function policemen(req, res) { //traer policías
	Usuario.find({role: 'agent'}).exec(function (error, data) {
		res.json({
			agents: data
		});
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

api.post('/vehicle_theft', function _complaint(req, res) {
	var body = req.body;
	Usuario.find({_id: req.body.user}, function(error, user) { //Se busca el usuario que emitió el alerta
		var vehicle;
		if(user.role == 'admin') { //Se comprueba si el que emitió el alerta es uno de los de monitoreo
			//Si es emitida por monitoreo se guarda con state: 0 (no confirmada)
			vehicle = new Vehicle(req.body);
			vehicle
			.save()
			.then(function (theft_vehicle) {
				res.json({
					success: true,
					message: "Robo de vehículo reportado exitosamente",
					theft: theft_vehicle,
					type: 'theft_vehicle'
				});
			})
			.catch(function (error) {
				res.json({
					success: false,
					error: error
				});
			});
		}
		else {
			body.state = 1;
			vehicle = new Vehicle(body);
			vehicle
			.save()
			.then(function _then(theft_vehicle) {
				res.json({
					success: true,
					message: "Robo de vehículo reportado exitosamente",
					theft: theft_vehicle,
					type: 'theft_vehicle'
				});
			})
			.catch(function _catch(error) {
				res.json({
					success: false,
					error: error,
					theft: []
				});
			});
		}
	});
	/*var denuncia = new Denuncia(req.body); denuncia .save() .then(function (denuncia) {res.json({success: true, denuncia: denuncia }); }) .catch(function (error) {res.json({success: false, error: error})});*/
});

api.post('/theft', function _theft(req, res) {
	var theft = new Theft(req.body);
	theft
	.save()
	.then(function _then(_theft) {
		res.json({
			success: true,
			message: "Robo reportado exitosamente",
			theft: _theft,
			type: 'theft'
		});
	})
	.catch(function _catch(error) {
		res.json({
			success: false,
			theft: [],
			error: error
		});
	});
});

api.post('/alert', function _alert(req, res) {
	var _alert = new Alert(req.body);
	_alert
	.save()
	.then(function fn(alert_general) {
		res.json({
			success: true,
			message: "Alerta reportada exitosamente",
			theft: alert_general,
			type: 'alert'
		});
	})
	.catch(function fnError(error) {
		res.json({
			success: false,
			theft: [],
			error: error
		});
	});
});

api.get('/logout', function logout(req, res) {
	res.clearCookie('id');
	res.clearCookie('role');
	res.clearCookie('user');
	res.send("Ok");
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
			res.cookie('id', data._id, {expires: new Date(Date.now() + 900000000) });
			res.cookie('role', data.role, {expires: new Date(Date.now() + 900000000) });
			res.cookie('user', data.name, { expires: new Date(Date.now() + 900000000)});
			res.json({
				success: true,
				user: data
			});
		}
	});
});

api.get('/alert/vehicle/:id', function getVehicle(req, res) {
	var id = req.params.id;
	Vehicle.findOne({_id: id}, function callback(error, data) {
		res.json({alert: data});
	});
});

var $concat = function $concat(models) {
	async.concat(models, function (model, callback){
		var query = model.find({});
	});
};

server.get('/admin/crimes', auth.authNoSession, function crimes(req, res) {
	var data = {};
	var vehicles = Vehicle.find({}).exec();
	vehicles
	.then(function (vehicles_thefts) {
		data.vehicles = vehicles_thefts; 
		return Theft.find({}).exec();
	})
	.then(function (thefts) {
		data.thefts = thefts;
		return Alert.find({}).exec();
	})
	.then(function (alerts) {
		data.alerts = alerts;
		async.concat([Vehicle, Theft, Alert], function (model, callback) {
			var query = model.find({}).sort({date: -1});
			query.exec(function (err, docs) {
				if(err) throw err;
				callback(err, docs)
			});
		}, function (error, result) {
			if(error) throw error;
			result = result.sort(function (a, b) {
				return (a.date < b.date) ? 1 : (a.date > b.date) ? -1 : 0;
			});
			console.log(result);
			console.log("en admin");
			res.render('admin', {
				denuncias: result
			});
		});
	})
	.catch(function (error) {
		console.log(error);
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
server.get('/admin/alert/vehicle', function vehicles(req, res) {
	res.render('alert_vehicle_admin');
});
server.get('/admin/alert/theft', function thefts(req, res) {
	res.render('alert_theft_admin');
});

server.get('/user/chat', auth.authNoSession, function chat(req, res) {
	res.render('chat');
});

server.get('/user/chat/private', auth.authNoSession, function chatPrivate(req, res) {
	res.render('chat_user_private');
});

server.get('/admin/chat', auth.authNoSession, function chatAdmin(req, res) {
	Usuario.find({role: 'agent'}).exec(function (error, data) {
		res.render('chat_admin', {
			agents: data
		});
	});
});

server.get('/user', auth.authNoSession, function user(req, res){
	var id = req.cookies.id;
	Usuario.findOne({_id: id}).select('name lastname').exec(function (error, user) {
		var data = {};
		var vehicles = Vehicle.find({}).exec();
		vehicles
		.then(function (vehicles_thefts) {
			data.vehicles = vehicles_thefts; 
			return Theft.find({}).exec();
		})
		.then(function (thefts) {
			data.thefts = thefts;
			return Alert.find({}).exec();
		})
		.then(function (alerts) {
			data.alerts = alerts;
			async.concat([Vehicle, Theft, Alert], function (model, callback) {
				var query = model.find({}).sort({date: -1});
				query.exec(function (err, docs) {
					if(err) throw err;
					callback(err, docs)
				});
			}, function (error, result) {
				if(error) throw error;
				result = result.sort(function (a, b) {
					return (a.date < b.date) ? 1 : (a.date > b.date) ? -1 : 0;
				});
				res.render('index', {
					denuncias: result,
					name: user.name,
					lastname: user.lastname
				});
			});
		})
		.catch(function (error) {
			res.json({
				error: error
			});
		});
	});
});

server.get('/login', auth.authUser, function login(req, res) {
	res.render('login');
});

server.get('/user/theft_vehicle', auth.authNoSession, function vehicle(req, res) {
	res.render('vehicle');
});

server.get('/user/theft', auth.authNoSession, function theft(req, res) {
	res.render('theft');
});

server.get('/user/alert', function _alert(req, res) {
	res.render('alert');
});
/*server.get('/user/notifier', auth.authNoSession, function notifier(req, res) {
	res.render('notifier', {});
});*/
server.use('/api', api);
