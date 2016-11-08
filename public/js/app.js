$(document).ready(function _load() {
	const api = "https://67.205.154.65:443";
	const socket = io.connect(api, {
		secure: true
	});
	//const socket = io.connect();
	var $inputMessage = $("#message");
	$(".datepicker").pickadate();

	function sendMessage() {
		var message = $inputMessage.val().trim();
		var username = JSON.parse(localStorage["user"]).name;
		/*var username = "Kevin";*/
		if(message != "") {
			var $message = '<div style="margin-bottom: 0; padding-bottom: 0;" class="row local"><div class="col s11 m8 offset-m2 l6 offset-l3"><div style="box-shadow: none;margin: 0;padding: 0;" class="card-panel white"> <div class="row valign-wrapper"><div style="padding: 0.5em; border-radius: 8px;" class="col s10 red white-text"><h5 style="font-weight: 600;" class="no-margin">'+ username +'</h5><span>' + message + '</span></div><div class="col s3"><img src="/images/alfonso.png" alt="" class="circle responsive-img"></div></div></div></div></div>';
			//var $message = "<div class='row local'><div class='col s11 m8 offset-m2 l6 offset-l3'> <div class='card-panel grey lighten-5 z-depth-1'> <div class='row valign-wrapper'> <div class='col s3'> <img src='/images/alfonso.png' alt='' class='circle responsive-img' /> </div> <div class='col s10'> <h5 class='no-margin' style='font-weight: 600;'>" + username +"</h5><span class='black-text'> " + message + " </span> </div> </div> </div> </div></div>"
			$("#container-chat").append($message);
			socket.emit('message private admin', {message: message, username: username});
			$inputMessage.val('');
		}
	};

	$inputMessage.keydown(function (event) {
		if(event.which === 13) {
			sendMessage();
		}
	});

	var getId = function getId(){
		var id = JSON.parse(localStorage["user"])._id;
		return id;
	};

	socket.on('message agent', function newMessage(data) { //Escucha algún nuevo mensaje que venga del admin
		if(!data.id) { //es un mensaje para todos
			var $message = '<div class="row destination"><div class="col s11 m8 offset-m2 l6 offset-l3"><div style="box-shadow: none;margin: 0;padding: 0;" class="card-panel white"> <div class="row valign-wrapper"><div class="col s3"><img src="/images/alfonso.png" alt="" class="circle responsive-img"></div><div style="padding: 0.5em; border-radius: 8px;" class="col s10 blue white-text"> <h5 style="font-weight: 600;" class="no-margin">' + data.username + '</h5><span>' + data.message + '</span></div></div></div></div></div>';
			$("#container-chat").append($message);
		}
		else if(data.id == getId()) { //Es privado
			var $message = '<div class="row destination"><div class="col s11 m8 offset-m2 l6 offset-l3"><div style="box-shadow: none;margin: 0;padding: 0;" class="card-panel white"> <div class="row valign-wrapper"><div class="col s3"><img src="/images/alfonso.png" alt="" class="circle responsive-img"></div><div style="padding: 0.5em; border-radius: 8px;" class="col s10 blue white-text"> <h5 style="font-weight: 600;" class="no-margin">' + data.username + ' (privado)</h5><span>' + data.message + '</span></div></div></div></div></div>';
			$("#container-chat").append($message);
		}
	});

	/*if($("#map").length > 0) {
		var map = new GMaps({
			div: '#map',
			lat: 14.537558,
	  		lng: -91.677297,
	  		zoom: 13
		});
	}*/

	const events = {
		locate: function _locate(event) {
			var $element = $(event.target);
			var successLocation = function successLocation(position) {
				$("#latitud").text(position.coords.latitude);
				$("#longitud").text(position.coords.longitude);
				/*map.addMarker({
					lat: position.coords.latitude,
					lng: position.coords.longitude,
					draggable: true,
					dragend: function (position) {
						$("#latitud").text(position.latLng.lat());
						$("#latitude-input").val(position.latLng.lat());

						$("#longitud").text(position.latLng.lng());
						$("#longitude-input").val(position.latLng.lng());
					}
				});
				map.setCenter(position.coords.latitude, position.coords.longitude, function callback() {
					$("#latitud").text(position.coords.latitude);
					$("#latitude-input").val(position.coords.latitude);
						
					$("#longitud").text(position.coords.longitude);
					$("#longitude-input").val(position.coords.longitude);
				});*/
			};
			var errorLocation = function errorLocation(error) {
				console.log(error);
			};
			navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {enableHighAccuracy: true});
		},
		save: function save() {
			var $form = $("#form");
			var serialize = $form.serializeJSON();
			var route = $form.attr('data-route');
			console.log(route);
			serialize.location = {
				latitude: $("#latitud").text(),
				longitude: $("#longitud").text()
			};
			serialize.user = JSON.parse(localStorage.user)._id;
			serialize.state = 0;
			var xhr = $.post(api + '/api/complaint', serialize);
			//var xhr = $.post(route, serialize);
			xhr
			.done(function done(response) {
				document.form_denuncia.reset();
				$("#latitud").text("");
				$("#longitud").text("");
				socket.emit('denuncia', {theft: response.theft, type: response.type});
				Materialize.toast(response.message, 1200, null, function () {
					window.location.href = "/user";
				});
			})
			.fail(function fail() {
				console.log(arguments);
			});
		},
		support52: function support52() {
			var geolocation = {
				success: function success(position) {
					socket.emit('support52', {
						location: {
							latitude: position.coords.latitude,
							longitude: position.coords.longitude
						},
						message: "¡NECESITAMOS APOYO!"
					})
				},
				error: function error(error) {
					Materialize.toast("Ocurrió un error", 1000);
				},
				options: {
					enableHighAccuracy: true
				}
			};
			navigator.geolocation.getCurrentPosition(geolocation.success, geolocation.error, geolocation.options);
		},
		notifier: function notifier() {
			$("#alert").openModal();
		},
		chat: function chat() {
			$("#alert_chat").openModal();
		},
		updateLocation: function updateLocation() {
			var geolocation = {
				success: function success(position) {
					var location = JSON.stringify({latitude: position.coords.latitude, longitude: position.coords.longitude});
					var id = JSON.parse(localStorage.user)._id;
					//var xhr = $.ajax({url: '/api/user/' + id + '/location/' + location, type: 'PUT'});
					
					var xhr = $.ajax({url: api + '/api/user/' + id + '/location/' + location, type: 'PUT'});
					xhr
					.done(function (response) {
						Materialize.toast('Ubicación actualizada exitosamente', 1200);
					})
					.fail(function () {
						Materialize.toast('Ocurrió un error al actualizar la ubicación', 1200);
					});
				},
				error: function error(error) {
					console.log(error);
				},
				options: {
					enableHighAccuracy: true
				}
			};
			navigator.geolocation.getCurrentPosition(geolocation.success, geolocation.error, geolocation.options);
		}
	};

	$("#locate").on('click', events.locate);
	$("#save").on('click', events.save);
	$("#notifier").on('click', events.notifier);
	$("#chat").on('click', events.chat);
	$('select').material_select();
	$('#apoyo52').on('click', events.support52);
	$("#update_location").on('click', events.updateLocation);
});