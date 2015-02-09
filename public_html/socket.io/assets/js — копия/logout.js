function logout () {
	var sid = $.cookie("sid");
	if (sid !== undefined) {
		var sidReplaced = ($.cookie("sid")).replace(/"/g, "");
		MB.Core.sendQuery({command:"logout", sid:sidReplaced}, function (data) {});
    	$.removeCookie("sid");
    	document.location.href = "login.html";
	} else {
		document.location.href = "login.html";
	}
}
logout();



