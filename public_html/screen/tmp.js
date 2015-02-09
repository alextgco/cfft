var arr = [];
var f = function () {
    $("*").each(function () {
        var style = $(this)[0].style;
        for (var i in style) {
            if (style[i]==="") continue;
            arr.push(i);
        }
    });
    console.log('ready ', arr.length);
}