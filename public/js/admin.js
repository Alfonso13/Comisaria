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
			$(document).on('click', '.deleteAgent', function deleteAgent(event) {
				var $id = $(event.currentTarget).parent().attr('data-id');
				$("#alert_confirm_delete_agent").attr('data-id', $id).openModal();
			});

			$("#true_delete").on('click', function (event) {
				var $id = $(event.currentTarget).parent().parent().attr('data-id');
				//var xhr = $.ajax({url: '/api/user/' + $id, type: 'DELETE'});
				var xhr = $.ajax({url: api + '/api/user/' + $id, type: 'DELETE'});
				xhr
				.done(function (response) {
					$("#list-agents li").each(function (index, $li) {
						if($($li).attr('data-id') == $id) {
							$($li).hide();
							$("#alert_confirm_delete_agent").closeModal({
								complete: function () {
									Materialize.toast("Eliminado exitosamente", 2000);
								}
							});
						}
					});
				})
				.fail(function (error) {
					console.log(error);
				});
			});

			$(document).on('click', '.changeState', function changeState() {
				
			});


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

			//var all = $.get('/api/policemen');
			var all = $.get(api + '/api/policemen');
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
			$(document).on('click', '.finalize', function finalize(event) {
				var $button = $(event.currentTarget);
				var $parent = $button.parent();
				var id = $parent.attr('data-id');
				var type = $parent.attr('data-type');
				//var xhr = $.ajax({url: '/api/user/' + type + '/' + id + '/state/2', type: 'PUT'});
				var xhr = $.ajax({url: api + '/api/user/' + type + '/' + id + '/state/2', type: 'PUT'});
				xhr
				.done(function done(response) {
					if(response.success) {
						$parent.removeClass('teal lighten-4').addClass('red lighten-4');
						socket.emit('confirm', response.theft);
						$button.hide();
					}
				})
				.fail(function fail(error) {
					console.log(error);
				});
			});
			$(document).on('click', '.item-complaint', function clickComplaint() {
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
			//var xhr = $.get('/api/alerts');
			var xhr = $.get(api + '/api/alerts');
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


	const socket = io.connect(api, {
		secure: true
	});
	/*const socket = io.connect();*/
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
			var $message = '<div style="margin-bottom: 0; padding-bottom: 0;" class="row local"><div class="col s11 m8 offset-m2 l6 offset-l3"><div style="box-shadow: none;margin: 0;padding: 0;" class="card-panel white"> <div class="row valign-wrapper"><div style="padding: 0.5em; border-radius: 8px;" class="col s12 red white-text"><h5 style="font-weight: 600;" class="no-margin">' + name + '</h5><span>' + message + '</span></div></div></div></div></div>';
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
		var $message = '<div class="row destination"><div class="col s11 m8 offset-m2 l6 offset-l3"><div style="box-shadow: none;margin: 0;padding: 0;" class="card-panel white"> <div class="row valign-wrapper"><div style="padding: 0.5em; border-radius: 8px;" class="col s12 blue white-text"> <h5 style="font-weight: 600;" class="no-margin">' + data.username + '</h5><span>' + data.message + '</span></div></div></div></div></div>';
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

	socket.on('confirm', function confirmComplaint(data) {
		$("#list-denuncias li").each(function (index, $li) {
			if($($li).attr('data-id') == data._id) {
				$($li).addClass('teal lighten-4');
				$($li).children(".no-confirmed").hide();
				$($li).children("a").show();
			}
		});
	});
	
	$(".datepicker").pickadate();
	
	$(document).on('click', '.attend', function click() {
		
	});

	$(document).on('click', '.send-agent-message', function click() {
		var me = this;
		
		var id = $(me).parents("li.collection-item").attr('data-id');

		
		var xhr = $.get(api + '/api/user/'+id);
		//var xhr = $.get('/api/user/'+id);
		xhr
		.done(function done(response) {
			var user = response.user;
			var $chip = "<div class='chip' data-id='"+ user._id +"'> "+ user.name + " " + user.lastname + " <span class='close'>x</span></div>";
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
		var xhr = $.post(api + '/api/user', serialize);
		//var xhr = $.post('/api/user', serialize);
		xhr
		.done(function done(response) {
			if(response.success) {
				$("#add_police").closeModal();
				Materialize.toast("Creado exitosamente", 2000);
				var $agent = "<li class='collection-item avatar'><h4 class='no-margin title bold'>"+ response.user.name + ' ' + response.user.lastname +"</h4> <p class='no-margin'>Policia</p> <p class='no-margin'>Ingreso: "+ response.user.entry +"</p> </li>";
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

	$("#emit_alert").on('click', function emitAlert() {
		$("#alert_admin").openModal();
	});
	$("#locate").on('click', function locate() {
		var successLocation = function successLocation(position) {
			$("#latitud").text(position.coords.latitude);
			$("#longitud").text(position.coords.longitude);
			map.addMarker({
				lat: position.coords.latitude,
				lng: position.coords.longitude,
				draggable: true,
				dragend: function dragend(position) {
					console.log(position);
					$("#latitud").text(position.latLng.lat());
					$("#longitud").text(position.latLng.lng());
				}
			});
		};
		var errorLocation = function errorLocation(error) {
			console.log(error);
		};
		navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {enableHighAccuracy: true});
	});
	$("#save").on('click', function save() {
		var $form = $("#form");
		var serialize = $form.serializeJSON();
		var route = $form.attr('data-route');
		var is = $("#is").val();

		serialize.location = {
			latitude: $("#latitud").text(),
			longitude: $("#longitud").text()
		};
		serialize.user = JSON.parse(localStorage.user)._id;
		serialize.state = 0;
		serialize.is = is;

		//var xhr = $.post(api + '/api/complaint', serialize);
		var xhr = $.post(api + route, serialize);
		xhr
		.done(function done(response) {
			$("#latitud").text("");
			$("#longitud").text("");
			socket.emit('denuncia', {theft: response.theft, type: response.type});
			
			document.form_denuncia.reset();
			Materialize.toast(response.message, 1200, null, function () {
				window.location.href = "/admin/crimes";
			});
		})
		.fail(function fail() {
			console.log(arguments);
		});
	});
	$('select').material_select();
});