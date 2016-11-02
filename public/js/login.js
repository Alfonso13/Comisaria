$(document).ready(function ready() {
	$("#login").on('click', function login() {
		var serialize = $("#form-login").serializeJSON();
		var xhr = $.get('/api/authenticate/' + JSON.stringify(serialize));
		
		xhr
		.done(function done(response) {
			console.log(response);
			if(response.success) {
				localStorage["user"] = JSON.stringify(response.user);
				Materialize.toast("Autenticación exitosa", 2000, null, function callback() {
					if(response.user.role == 'admin') {
						window.location.href = "/admin/crimes";
					}
					else if(response.user.role == 'agent') {
						window.location.href = "/user";
					}
				});
			}
		})
		.fail(function fail() {
			console.log(arguments);
		});
	});
});