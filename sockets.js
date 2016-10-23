const Message = require('./models/message');

function Sockets(io) {
	io.on('connection', function (socket) {
		console.log("Alguien se ha conectado con Sockets");
		socket.on('denuncia', function socket_denuncia(data) {
			console.log("Hemos llegado a denuncia");
			socket.broadcast.emit('denuncia comisaria', data);
		});
		socket.on('new message', function _new_message() {
			
		});
		socket.on('typing', function typing() {
			
		});
		socket.on('stop typing', function stopTyping() {
			
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