function logout () {
	var sid = $.cookie("sid");
	if (sid !== undefined) {
		var sidReplaced = ($.cookie("sid")).replace(/"/g, "");
		$.removeCookie("sid");
		MB.Core.sendQuery({command:"logout", sid:sidReplaced}, function () {});
    	
	} else {
		console.log("sid равен undefined");
	}
	document.location.href = "login.html";
}