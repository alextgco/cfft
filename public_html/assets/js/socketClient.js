//socket = io.connect('http://192.168.1.101:8080');
//var ip = document.location.href.match(/((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)/)[0];
var ip = "192.168.2.70";
var port = 8080;
//var protocol = location.protocol;
//var protocol = "http:";
var protocol = "ws:";


//var path_dir = location.pathname.replace(/multibooker\/[a-zA-Z]+\.[a-zA-Z]+/,'');
var path_dir = (location.pathname.indexOf('multibooker')!==-1)? location.pathname.replace(/multibooker\/.+/,'multibooker/') : '/';
if (typeof MB==="object"){
    MB.Core.doc_root = location.origin+path_dir;
}
if (!ip.match(/192\./)) port = 8080;
var socket;
if (ip=="localhost"){
    ip = "192.168.2.70";
    MB.Core.doc_root = '/2.70/public_html/';
    socket = io.connect('http://'+ip+':'+port);
}else{
    socket = io.connect('//'+ip+':'+port);
}
var delivery;
//socket = io.connect('http://109.107.177.142:8080');
//var socket =


socket.on('connect', function (data) {
//    toastr['success']('Соединение с сервером установлено.');
    console.log("socket.on('connect')");
    var counter = 0;
    function setUser() {
        if (typeof MB!=="object"){
            return;
        }
        if (typeof MB.User!=="object" || counter>3000){
            return;
        }
        if (MB.User.username!=undefined){
            var page = MB.User.connectPage || '';
            socket.emit('setUser', MB.Core.getUserGuid(), MB.User.username, MB.User.sid, page);

            var cash_desk_id = (localStorage.getItem('cashBoxPairs'))? JSON.parse(localStorage.getItem('cashBoxPairs')): false;

            if(cash_desk_id){
                socketQuery({
                    command: 'operation',
                    object: 'set_cash_desk',
                    sid: MB.User.sid,
                    params:{
                        cash_desk_id: cash_desk_id.cashBoxId
                    }
                },function(res){
                    $('#changeCashBox').html(cash_desk_id.cashBoxName);
                });
            }else{
                $('#changeCashBox').html('Касса не выбрана');
            }
            MB.Core.loaded = true;
            console.log('setUserEmit ' +  MB.User.username);

        }else{
            setTimeout(function(){

                setUser();
                counter++;
            },10);
        }
    }
    setUser();

    if (typeof Delivery!=="undefined"){
        var delivery1 = new Delivery(socket);
        delivery1.on('delivery.connect',function(delivery0){
            delivery = delivery0;
        });
    }
});


socket.on('disconnect', function (data) {
//    toastr['error']('Соединение с сервером прервано.');
    console.warn('Соединение с сервером прервано.');
});

socket.on('error', function (data) {
    toastr['error']('Сокет не может подключиться. Проверьте порт '+port);
});

socket.on('message', function (obj) {
    if (typeof obj !== "object") {
        console.log("socket.on('message'):");
        console.log(obj);
        return;
    }
    var mode = obj.mode || "normal";
    switch (mode) {
        case "getFile":
            var fileName = obj.fileName;
            var shortName = fileName.substring(fileName.lastIndexOf('/') + 1, fileName.length);
            $("body").prepend('<a id="my_download_link" href="' + obj.fileName + '" download="' + shortName + '" style="display:none;"></a>');
            $("#my_download_link")[0].click();
            $("#my_download_link").remove();
            break;
        default :
            break;
    }
});

$(".news-page").html();
socket.on('log', function (data) {
    //log(data);
    //data = $.parseJSON(data);
    console.log(data);
    //console.log(data.TOTAL_PLACE_COUNT);
});
socket.on('logBody', function (data) {
    //log(data);
    var type = 'error';
    var title = '';
    toastr[type](data, title);
    //data = $.parseJSON(data);
    //console.log(data);
    //console.log(data.TOTAL_PLACE_COUNT);
});


function getData(obj){
    socket.emit('getData',obj);
}
function getFile(obj,callback){
    socket.emit('getFile',obj);
}


function sendToAll(obj,callback){
    socket.emit('sendToAll',obj);
}
socket.on('sendToAll', function (obj) {
    /*try {
        var msg = JSON.parse(obj.message);
        obj.message = 'Получен валидный JSON. См. консоль';
        console.log(msg);

    } catch (e) {
    }*/
    MB.Core.lockScreen.init({
        title: obj.title || 'Сообщение от администратора',
        content: obj.message || '',
        buttons: [
            {
                title: "Ok",
                className: "",
                id: "",
                callback: function(param){
                    MB.Core.lockScreen.close();
                }
            }
        ]
    }, function(wrapper){

    });

});
function send(command,obj,callback){
    socket.emit(command,obj);
    if (typeof callback==="function"){
        socket.removeAllListeners(command).on(command,function(data){
            console.log("SEND CALLBACK "+command);
            callback(data);
        });
    }
}

/*var socketQueryCallback = function(result){
    console.log(result);
};*/

var createGuid = function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r, v;
        r = Math.random() * 16 | 0;
        v = (c === "x" ? r : r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
};

var socketQuery_stack = {
    items:{},
    getItem:function(id){
        return this.items[id];
    },
    addItem:function(item){
        var id = createGuid();
        this.items[id] = {
            callback:item
        };

        return id;
    },
    /*clearEmpty:function(){
        for(var i=0; i< this.items.length; i++){
            if(this.items[i] === undefined){
                this.items.splice(i,1);
                this.clearEmpty();
            }
        }
    },*/
    removeItem:function(id){

        //delete this.items[this.getItemIndex(id)];
        delete this.items[id];
        //this.clearEmpty();
    }
};
socketQuery = function(obj,callback,type){
    if (typeof callback==="function")
        var id = socketQuery_stack.addItem(callback);
    if (obj.sid===undefined && typeof MB==="object"){
        if (typeof MB.User==="object"){
            obj.sid = MB.User.sid;
        }
    }
    socket.emit('socketQuery',obj,id,type);
};
socket.on('socketQueryCallback', function (callback_id,result) {
    var item = socketQuery_stack.getItem(callback_id);
    if (typeof item!=="object") return;
    // Выведем ошибки в консоль
    var res, code;
    if (res = JSON.parse(result)) {
        if (res && res['results'] && (res = res['results'][0])) {
            if (code = res['code']) {
                if (+code !== 0) console.log(res);
                if (+code === -2) {
                    $.removeCookie('username');
                    $.removeCookie('password');
                    $.removeCookie('sid');
                    $.removeCookie('userfullname');
                    location = '/login.html';
                }
            }
        }
    }
    if (typeof item.callback ==="function"){
        item.callback(result);
    }
    socketQuery_stack.removeItem(callback_id);
});
toggleLog = function(){
    socket.emit('toggleLog');
};

//toggleLog();

socket.on('print', function (data) {
    $(document).trigger('print',[data]);
});
printQuery = function(obj){
    socket.emit('print',obj,MB.Core.getUserGuid());
};
DOQuery = function(obj){
    socket.emit('DO',obj,MB.Core.getUserGuid());
};
/*
* Для Clientscreen
* */
socket.on('toClientscreen', function (obj) {
    $(document).trigger('toClientscreen',[obj]);
});

toClientscreen = function(obj){
    socket.emit('toClientscreen',obj,MB.Core.getUserGuid());
};
clientscreenInit = function(){
    return;
    socket.emit('clientscreenInit',MB.Core.getUserGuid());
};









