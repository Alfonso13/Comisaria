const Message = require('./models/message');

function Sockets(io) {
	io.on('connection', function (socket) {
		console.log("Alguien se ha conectado con Sockets");
		socket.on('denuncia', function socket_denuncia(data) {
			socket.broadcast.emit('denuncia comisaria', data);
			socket.broadcast.emit('denuncia', data);
		});
		socket.on('message admin', function _new_message(data) {  //Escucha algún mensaje nuevo que venga del admin
			socket.broadcast.emit('message agent', {  //Envía el mensaje a todos los agentes
				message: data.message,
				username: data.username,
				id: data.id
			});
		});
		socket.on('message private admin', function private(data) {
			socket.broadcast.emit('message private admin', {message: data.message, username: data.username});
		});
		socket.on('message', function _message(message) {
			var chat_message = new Message({
				user: 1,
				destination: 2,
				message: message,
				date: Date.now()
			});
			chat_message
			.save()
			.then(function _then(new_message) {
				socket.broadcast.emit('message response', new_message);
			});
		});
	});
};

module.exports = Sockets;