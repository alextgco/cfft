function loginFormSubmit() {
	var usr = $('#username'),
		pass = $('#password'),
		username = usr.val(),
		password = pass.val(),
		obj = {command: "login", "username": username, "password": password, "guid": MB.Core.getUserGuid()};
	toastr.options = {
		"showDuration": "200",
		"hideDuration": "500",
		"timeOut": "3000"
	};
	if (!username.length && !password.length) {
		toastr['error']('Введите имя пользователя и пароль!', 'ОШИБКА');
		var logPass = usr.add(pass).addClass('err');
		usr.focus();
		setTimeout(function () {
			logPass.removeClass('err')
		}, 3000);
		return false;
	} else if (!username.length) {
		toastr['error']('Введите имя пользователя!', 'ОШИБКА');
		usr.addClass('err').focus();
		setTimeout(function () {
			usr.removeClass('err')
		}, 3000);
		return false;
	} else if (!password.length) {
		toastr['error']('Введите пароль!', 'ОШИБКА');
		pass.addClass('err').focus();
		setTimeout(function () {
			pass.removeClass('err')
		}, 3000);
		return false;
	}
	socketQuery(obj, function (response) {
		if(response == ''){
			toastr['error']('Ошибка соединения c базой данных!', 'ОШИБКА');
		}
		console.log(response);
		response = JSON.parse(response);
		var DATA = (response.results) ? response.results[0] : response,
			code = parseInt(DATA.code);
		console.log(DATA);
		if (code === 0) {
			$.cookie("sid", DATA.sid, {expires: 7});
			$.cookie('username', username, {expires: 7});
			$.cookie('password', password, {expires: 7});
			$.cookie('userfullname', DATA.user_fullname, {expires: 7});
			var hashSplit = document.location.href.split("//");
			var href = hashSplit[0] + '//';

			for (var k = 0; k < hashSplit[1].split("/").length - 1; k++) {
				href += hashSplit[1].split("/")[k] + '/';
			}
			console.log('href: ' + href);
			$('html').removeClass('go').addClass('hide');
			setTimeout(function () {
				document.location.href = href;
			}, 500);
		} else {
			var tstr = DATA.toastr;
			toastr[tstr.type](tstr.message, tstr.title);
			var logPass = usr.add(pass).addClass('err');
			setTimeout(function () {
				logPass.removeClass('err')
			}, 3000);
		}
	});
}

$(function () {
	$('html').addClass('go');
	$('input').on('keypress', function (e) {
		if (e.keyCode == 13) {
			loginFormSubmit();
		}
	});
	$('.login-submit').on('click', function () {
		loginFormSubmit();
		return false;
	});
	$('#form').on('submit', function () {
		return false;
	});
});