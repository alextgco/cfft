/******------------Системные листенеры и эмиты с сервера---------------********/
$(window).resize(function(e){
    $.event.trigger('screen_resize');
});
socket.removeAllListeners('toClientscreen').on('toClientscreen', function (obj) {
    if (typeof obj !== "object") {
        return;
    }
    var type = obj.type;
    console.log(obj);
    switch (type) {
        case "list":
            clientScreen.showAfisha(obj);
            break;
        case "hall":
            clientScreen.showHall(obj);
            break;
        case "hightlight":
            clientScreen.highlight(obj);
            break;
        case "preorder":
            clientScreen.showOrder(obj);
            break;
        case "clear":
            clientScreen.clearAll();
            break;
        default :
            break;
    }
});


/******--------Клиентские листенеры------------------*****/
$(document).on('screen_resize',function(){
    resizeController.resize();
});
$(document).on('screen_resize_end',function(){
    console.log('screen_resize_end');
    //screen.resizeEnd
});
