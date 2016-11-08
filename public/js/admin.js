$(document).ready(function ready() {
	const api = "https://67.205.154.65:443";
	var map = null;
	
	if($("#map").length > 0) {

		map = new GMaps({
			div: '#map',
			lat: 14.537558,
	  		lng: -91.677297,
	  		zoom: 14
		});
		var markers = [];
		if($("#map").hasClass('map_agents')) { //Es el mapa de agentes

			$(document).on('click', '.item-agent', function ($event) {
				var id = $(this).attr('data-id');
				var _markers = map.markers;
				var marker = null;
				for(var i = 0 ; i < _markers.length ; i++) {
					if(_markers[i].getTitle() == id) {
						marker = _markers[i];
						break;
					}
				}
				if(marker.getAnimation() !== null) {
					marker.setAnimation(null);
				}
				else {
					marker.setAnimation(google.maps.Animation.BOUNCE);
				}
			});

			var all = $.get('/api/policemen');
			all
			.done(function (response) {
				if(response.agents.forEach) {
					response.agents.forEach(function (value, index) {
						markers.push({
							lat: value.currentLocation.latitude,
							lng: value.currentLocation.longitude,
							title: value._id,
							animation: google.maps.Animation.DROP
						});
					});
					map.addMarkers(markers);
				}
			})
			.fail(function (error) {
				console.log(error);
			})
		}

		if($("#map").hasClass('map_alerts')) {
			var xhr = $.get('/api/alerts');
			xhr
			.done(function done(response) {
				var vehicles = response.data.vehicles;
				var thefts = response.data.thefts;
				var alerts = response.data.alerts;
				var markers = [];
				
				if(vehicles.forEach) {
					vehicles.forEach(function (value, index) {
						markers.push({
							lat: value.location.latitude,
							lng: value.location.longitude,
							title: value._id,
							animation: google.maps.Animation.DROP
						});
					});
				}
				if(thefts.forEach) {
					thefts.forEach(function (value, index) {
						markers.push({
							lat: value.location.latitude,
							lng: value.location.longitude,
							title: value._id,
							animation: google.maps.Animation.DROP
						});
					});
				}
				if(alerts.forEach) {
					alerts.forEach(function (value, index) {
						markers.push({
							lat: value.location.latitude,
							lng: value.location.longitude,
							title: value._id,
							animation: google.maps.Animation.DROP
						});
					});
				}
				map.addMarkers(markers);
			});
		}
	}


	/*const socket = io.connect(api, {
		secure: true
	});*/
	const socket = io.connect();
	var $inputMessage = $("#message");
	var getId = function getId() {
		var id = JSON.parse(localStorage["user"])._id;
		return id;
	};
	function sendMessage() {
		var message = $inputMessage.val().trim();
		var name = JSON.parse(localStorage["user"]).name;
		if(message != "") {
			//var $message = "<div class='row local'><div class='col s11 m8 offset-m2 l6 offset-l3'> <div class='card-panel grey lighten-5 z-depth-1'> <div class='row valign-wrapper'> <div class='col s3'> <img src='/images/alfonso.png' alt='' class='circle responsive-img' /> </div> <div class='col s10'> <h5 class='no-margin' style='font-weight: 600;'>" + name + "</h5><span class='black-text'> " + message + " </span> </div> </div> </div> </div></div>"
			var $message = '<div style="margin-bottom: 0; padding-bottom: 0;" class="row local"><div class="col s11 m8 offset-m2 l6 offset-l3"><div style="box-shadow: none;margin: 0;padding: 0;" class="card-panel white"> <div class="row valign-wrapper"><div style="padding: 0.5em; border-radius: 8px;" class="col s10 red white-text"><h5 style="font-weight: 600;" class="no-margin">' + name + '</h5><span>' + message + '</span></div><div class="col s3"><img src="/images/alfonso.png" alt="" class="circle responsive-img"></div></div></div></div></div>';
			var $chat = $("#real-container-chat");
			var id = null;
			
			$chat.append($message);
			$("#container-chat").animate({scrollTop: $chat.height()}, "1000", "swing");
			$inputMessage.val('');

			if($("#chip .chip").attr('data-id')) {
				id = $("#chip .chip").attr('data-id');
				socket.emit('message admin', {message: message, username: name, id: id});
			}
			else {
				socket.emit('message admin', {message: message, username: name});
			}
		}
	};

	$inputMessage.keydown(function (event) {
		if(event.which === 13) {
			sendMessage();
		}
	});

	socket.on('message private admin', function newMessage(data) {
		var $message = '<div class="row destination"><div class="col s11 m8 offset-m2 l6 offset-l3"><div style="box-shadow: none;margin: 0;padding: 0;" class="card-panel white"> <div class="row valign-wrapper"><div class="col s3"><img src="/images/alfonso.png" alt="" class="circle responsive-img"></div><div style="padding: 0.5em; border-radius: 8px;" class="col s10 blue white-text"> <h5 style="font-weight: 600;" class="no-margin">' + data.username + '</h5><span>' + data.message + '</span></div></div></div></div></div>'
		$("#real-container-chat").append($message);
	});

	var parseDate = function parseDate(_date) {
		var date = new Date(_date);
		return date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();
	};

	socket.on('denuncia comisaria', function _connection(data) {
		var $html;
		var date = parseDate(data.theft.date);
		if(data.type == 'theft_vehicle') {
			$html = "<li class='collection-item'> <p><strong>H/R Vehículo</strong></p> <p class='no-margin'><strong>Fecha: </strong> "+ date +"</p> <p class='no-margin'><strong>Modalidad:</strong>"+ data.theft.type +"</p> <p class='no-margin'><strong>Tipo vehículo:</strong>" + data.theft.type_vehicle + " </p> <p class='no-margin'><strong>Marca: </strong>" + data.theft.brand + " </p><p class='no-margin'><strong>Color: </strong>" + data.theft.color + " </p><p class='no-margin'><strong>Placa: </strong>" + data.theft.plate + " </p><p class='no-margin'><strong>Dirección: </strong>" + data.theft.reference + "</p> <p class='no-margin'><strong>Modo: </strong> " + data.theft.mode +  " </p> <p class='no-margin'><strong>Denunciante: </strong> " + data.theft.whistleblower + " </p> <a class='waves-effect btn'>ATENDER</a> </li>";
		}
		if(data.type == 'theft') {
			$html = "<li class='collection-item'> <p><strong>Robo</strong></p> <p class='no-margin'><strong>Fecha: </strong> "+ date +"</p> <p class='no-margin'><strong>Robo a:</strong>"+ data.theft.theft_to +"</p> <p class='no-margin'><strong>Dirección robo:</strong>" + data.theft.theft_reference + " </p> <p class='no-margin'><strong>Vestimenta victimario: </strong>" + data.theft.victimizer_clothing + " </p><p class='no-margin'><strong>Objeto robado: </strong>" + data.theft.stolen_object + "</p><p class='no-margin'><strong>Denunciante: </strong>" + data.theft.whistleblower + " </p><a class='waves-effect btn'>ATENDER</a> </li>";
		}
		if(data.type == 'alert') {
			$html = "<li class='collection-item'> <p><strong>Alerta General</strong></p> <p class='no-margin'><strong>Dirección: </strong> "+ date +"</p> <p class='no-margin'><strong>Robo a:</strong>"+ data.theft.reference +"</p> <p class='no-margin'><strong>Descripción: </strong>" + data.theft.description + " </p><a class='waves-effect btn'>ATENDER</a> </li>";
		}

		$("#list-denuncias").prepend($html);
		map.addMarker({
			lat: data.theft.location.latitude,
			lng: data.theft.location.longitude
		});
	});
	
	$(".datepicker").pickadate();
	
	$(document).on('click', '.attend', function click() {
		
	});

	$(document).on('click', '.send-agent-message', function click() {
		var me = this;
		
		var id = $(me).parents("li.collection-item").attr('data-id');

		
		//var xhr = $.get(api + '/api/user/'+id);
		var xhr = $.get('/api/user/'+id);
		xhr
		.done(function done(response) {
			var user = response.user;
			var $chip = "<div class='chip' data-id='"+ user._id +"'> "+ user.name + " " + user.lastname + " <img src='/images/alfonso.png' alt='Contact Person' /> <span class='close'>x</span></div>";
			$("#chip").html($chip);
		})
		.fail(function fail(error) {
			console.log(error);
		});
	});

	$("#btn_add_police").on('click', function click() {
		$("#add_police").openModal();
	});
	$("#btn-save-police").on('click', function click() {
		var serialize = $("#form-new-agent").serializeJSON();
		//var xhr = $.post(api + '/api/user', serialize);
		var xhr = $.post('/api/user', serialize);
		xhr
		.done(function done(response) {
			if(response.success) {
				$("#add_police").closeModal();
				Materialize.toast("Creado exitosamente", 2000);
				var $agent = "<li class='collection-item avatar'><img src='/images/alfonso.png' class='circle'/> <h4 class='no-margin title bold'>"+ response.user.name + ' ' + response.user.lastname +"</h4> <p class='no-margin'>Policia</p> <p class='no-margin'>Ingreso: "+ response.user.entry +"</p> </li>";
				$("#list-agents").prepend($agent);
			}
		})
		.fail(function fail() {
			console.log(arguments);
		});
	});

	$('#cerrar_denuncias').on('click', function cerrar() {
		var $container = $("#container-denuncias");
		var $me = $(this);
		if($me.hasClass('closed')) { //Ya fue cerrado el bloque
			$("#container-map").removeClass('s12').addClass('s8');
			$container.animate({marginLeft: "0%"}, 1200, "swing");
			$me.text("CERRAR").removeClass('closed');
		}
		else {
			$container.animate({marginLeft: "-33.3333333333%"}, 1200, "swing", function () {
				$("#container-map").removeClass("s8").addClass("s12");
				$me.text("MOSTRAR").addClass('closed');
			});
		}
	});

	$("#general_message").on('click', function genera_chat() {
		var html = "<div class='chip'> Todos </div>";
		$("#chip").html(html);
	});
});