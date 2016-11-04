$(document).ready(function ready() {
	const api = "https://67.205.154.65:80";
	
	if($("#map").length > 0) {

		var map = new GMaps({
			div: '#map',
			lat: 14.537558,
	  		lng: -91.677297,
	  		zoom: 14
		});

		//var all = $.get(api + '/api/complaint');
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
	}

	const socket = io.connect(api, {
		secure: true
	});
	//const socket = io.connect();
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

	socket.on('denuncia comisaria', function _connection(data) {
		$("#list-denuncias").prepend("<li class='collection-item'><span class='title'><strong>Descripción: </strong> "+ data.description +"</span> <p class='no-margin'><strong>Dirección: </strong> "+ data.address +"</p> <p class='no-margin'><strong>Fecha: </strong> "+ data.date +"</p> <p class='no-margin'><strong>Observación: </strong>"+ data.observation +"</p> <a class='waves-effect btn'>ATENDER</a> </li>");
		map.addMarker({
			lat: data.location.lat,
			lng: data.location.lng
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
		var xhr = $.post(api + '/api/user', serialize);
		//var xhr = $.post('/api/user', serialize);
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

});