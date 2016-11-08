$(document).ready(function _ready() {
	const api = "https://67.205.154.65:443";
	$(".logout").on('click', function logout() {
		var xhr = $.get(api + '/api/logout');
		xhr
		.done(function done() {
			window.location.href = "/login";
		})
		.fail(function fail() {
			console.log(arguments);
		});
	});
});