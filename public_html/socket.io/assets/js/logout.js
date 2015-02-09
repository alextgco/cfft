function logout () {
	var sid = $.cookie("sid");
	// console.log(sid);
	if (sid !== undefined) {
		var sidReplaced = ($.cookie("sid")).replace(/"/g, "");
		MB.Core.sendQuery({command:"logout", sid:sidReplaced}, function (data) {
			$.removeCookie("sid");
    		document.location.href = "http://192.168.1.101/multibooker/login.html";
		});
    	
	} else {
		console.log("sid равен undefined");
		document.location.href = "http://192.168.1.101/multibooker/login.html";
	}
}
logout();



