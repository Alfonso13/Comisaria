$(document).ready(function _load() {
	const socket = io.connect('http://localhost:3000');
	var map = new GMaps({
		div: '#map',
		lat: 14.537558,
  		lng: -91.677297,
  		zoom: 13
	});

	const events = {
		locate: function _locate(event) {
			var $element = $(event.target);
			var successLocation = function successLocation(position) {
				map.addMarker({
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
				});

			};
			var errorLocation = function errorLocation(error) {
				console.log(error);
			};
			navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {enableHighAccuracy: true});
		},
		save: function save() {
			var serialize = $("#form-denuncia").serializeJSON();
			serialize.location = {
				lat: $("#latitude-input").val(),
				lng: $("#longitude-input").val()
			};
			var xhr = $.post('/api/complaint', serialize);
			var required = ['direction', 'description', 'date', 'observation'];
			
			xhr
			.done(function done(response) {
				document.form_denuncia.reset();
				$("#latitud").text("");
				$("#longitud").text("");
				socket.emit('denuncia', response.denuncia);
				Materialize.toast("Denuncia envíada correctamente", 500);
				//window.location.href = "/user";
			})
			.fail(function fail() {
				console.log(arguments);
			});
		}
	};
	/*$("#form-denuncia").validate({rules: {direction: {required: true }, description: {required: true } }, messages: {direction: "Ingresa una dirección", description: "Ingresa una descripción"}, errorElement: "div", errorPlacement: function (error, element) {var placement = $(element).data('error'); if(placement) {$(placement).append(error); } else {error.insertAfter(element); } } });*/
	
	$("#locate").on('click', events.locate);
	$("#save").on('click', events.save);
});