$(document).ready(function ready() {

	var map = new GMaps({
		div: '#map',
		lat: 14.537558,
  		lng: -91.677297,
  		zoom: 14
	});
	
	$(".add-police").on('click', function add_police() {
		
	});

	const socket = io.connect('http://localhost:3000');	

	socket.on('message response', function _message_response(message) {
		
	});

	socket.on('denuncia comisaria', function _connection(data) {
		$("#list-denuncias").prepend("<li class='collection-item'><span class='title'>"+ data.description +"</span> <p>"+ data.direction +"</p> <p>"+ data.date +"</p> <p>"+ data.observation +"</p> <a class='waves-effect btn'>MAPA</a> </li>");
		map.addMarker({
			lat: data.location.lat,
			lng: data.location.lng
		});
	});
	
	var all = $.get('/api/complaint');
	all
	.done(function (response) {
		var denuncias = response.denuncias;

		denuncias.forEach(function (denuncia) {
			if(denuncia.location) {
				map.addMarker({
					lat: denuncia.location.lat,
					lng: denuncia.location.lng
				});
			}
		});
	})
	.fail(function () {
		console.log(arguments);
	});
});