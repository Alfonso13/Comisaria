$(document).ready(function _ready() {
	$(".logout").on('click', function logout() {

	});

	const socket = io.connect('http://localhost:3000');
	$(".send-message").on('click', function _sendMessage() {
		var message = $("#message").val();
		socket.emit('message', message);
		//$("#container-chat")
	});
});