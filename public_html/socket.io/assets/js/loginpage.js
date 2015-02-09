var MBOOKER = MBOOKER || {};
MBOOKER.LoginPage = MBOOKER.LoginPage || {}; 

// $.cookie('username', "sargon");
// $.cookie('password', "123123123");
// $.cookie('sid', "123123");

// $.removeCookie('username');
// $.removeCookie('password');
// $.removeCookie('sid');

MBOOKER.LoginPage.username = $.cookie('username');
MBOOKER.LoginPage.password = $.cookie('password');
MBOOKER.LoginPage.sid      = $.cookie('sid');


if (MBOOKER.LoginPage.username !== undefined && 
	MBOOKER.LoginPage.password !== undefined && 
	MBOOKER.LoginPage.sid 	   !== undefined) {
	document.location.href = "index.html";
	// document.location.asign("http://192.168.1.101/multibooker4/index.htm");
} else {
} 

function logout () {
	var sid = $.cookie("sid");
    MB.Core.sendQuery({command:"logout", sid: sid}, function (data) {});
    $.cookie("sid", null);
    MBOOKER.LoginPage.sid = undefined;
}