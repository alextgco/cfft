//socket = io.connect('http://192.168.1.101:8080');
//var ip = document.location.href.match(/((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)/)[0];
var ip = location.hostname;
var port = 8080;
if (!ip.match(/192\./)) port = 8080;
var socket = io.connect('http://'+ip+':'+port);
var delivery;
//socket = io.connect('http://109.107.177.142:8080');
//var socket =


socket.on('connect', function (data) {
    window.setTimeout(function(){
        console.log('MB.User.username:');
        console.log(MB.User.username);

        if (MB.User!=undefined){
            socket.emit('setUser',MB.User.username,MB.User.sid);
        }
    },500);

    if (typeof Delivery!=="undefined"){
        var delivery1 = new Delivery(socket);
        delivery1.on('delivery.connect',function(delivery0){
            delivery = delivery0;
        });
    }
});

socket.on('message', function (data) {
    //  data = eval(data);
    //data = JSON.parse(data);
    console.log(data);
});

$(".news-page").html();
socket.on('log', function (data) {
    //log(data);
    //data = $.parseJSON(data);
    console.log(data);
    //console.log(data.TOTAL_PLACE_COUNT);
});



function getData(obj){
    socket.emit('getData',obj);
}
function send(command,obj){
    socket.emit(command,obj);
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
    socket.emit('socketQuery',obj,id,type);
};
socket.on('socketQueryCallback', function (callback_id,result) {
    var item = socketQuery_stack.getItem(callback_id);
    if (typeof item!=="object") return;
    if (typeof item.callback ==="function"){
        item.callback(result);
    }
    socketQuery_stack.removeItem(callback_id);
});
toggleLog = function(){
    socket.emit('toggleLog');
};














