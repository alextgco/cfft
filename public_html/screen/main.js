var sid;
function Initialization(callback) {
    sid = MB.User.sid;
    if (!sid) {
        $("body").html("<div>Необходима авторизация в системе</div>");
        return;
    }
    socket.emit('clientscreenInit', MB.Core.getUserGuid());
    /******-----------Дозагрузка------------*********/
    var scriptCount = 4;   /// Количество подгружаемых скриптов
    var loadedCount = 0;  /// Сколько загружено
    var loaded = function(){
        loadedCount++;
        if (loadedCount==scriptCount){
            if (typeof callback === "function"){
                callback();
            }
        }
    };
    $.getScript("funcs.js",loaded);
    $.getScript("screenClass.js",loaded);
    $.getScript("controller.js",loaded);
    $.getScript("listener.js",loaded);
    /******---END--------Дозагрузка------------*********/
}
$(document).ready(function () {
    Initialization();
    socket.on('init',function(newSid){
        MB.User.sid = newSid;
        Initialization();
    });
    toClientscreen({type:"list"});
    //setTimeout(function(){toClientscreen({type:"preorder", id:"3957"});}, 1000)

});

