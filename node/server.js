// note, io.listen(<port>) will create a http server for you
//var exec = require("child_process").exec;
var config = require('./config.js');
//var start  = require('./start.js');
var printerServer = require('./printerServer').listen(config.printerPort || 3000);


var privateKey = config.privateKey;
var certificate = config.certificate;
var ca = config.ca;
if (config.useHTTPS){

}
var serverParams = (config.useHTTPS)?{key:privateKey,cert:certificate,ca:ca} : {};
var io = require('socket.io').listen((config.socketPort || 8080),serverParams);

var clients = require('./clients').clients;

//var oracle = require('./oracle');
var oracle = require('./oracle2');
var dl  = require('delivery');
var fs  = require('fs');
var logF = require('./my_log').logF;
var getFile = require('./getFile').get;


var nowTime = function(){
    var d = new Date();
    return {
        time:d,
        timestamp:d.getTime()
    };
};

logF('Сервер запущен');



process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
    logF('Caught exception: ' + err);
});

function findInArray(arr,value){
    if (typeof arr!=="object") return false;
    for (var k in arr)
        if (arr[k]==value) return true;
    return false;
}

var countObj = function(obj){
    if (typeof obj!=="object"){
        return -1;
    }
    var counter = 0;
    for (var i in obj) {
        counter++;
    }
    return counter;
};


var server = {
   init:function(){
        var self = this;

        io.

            sockets.on('connection', function (socket) {
                console.log('Count sockets:');
                var count = countObj(socket.namespace.sockets);
                console.log(count);
                /**toClientscreen*/
                socket.on('clientscreenInit',function(guid){
                    var client = clients.getById(guid);
                    if (client){
                        client.clientSock.push(socket);
                    }
                });

                socket.on('toClientscreen',function(obj,guid){
                    var client = clients.getById(guid);
                    //console.log(client);
                    if (typeof client==="object"){
                        var clientSocks = client.clientSock;
                        for (var i in clientSocks) {
                            if (clientSocks[i]){
                                clientSocks[i].emit('toClientscreen',obj);
                            }
                        }
                    }
                });
                /**toClientscreen __END*/


                socket.on('error',function(err){
                    console.log(err);
                });
                ///"/app/instantclient_12_1"
                socket.flagLog = false;
                socket.on('toggleLog',function(){
                    socket.flagLog = !socket.flagLog;
                });
                function log(s){
                    if (socket.flagLog)
                        socket.emit('log',s);
                }
                var sendTime = function(s){
                    if (socket.flagLog)
                        socket.emit('log',s);
                };

                /*__________FOR PRINTER____________________________________________________*/

                socket.on('print',function(obj,guid){
                    clients.getFromClient(obj,guid);
                });

                socket.on('DO',function(obj,guid){
                    clients.getFromClient(obj,guid);
                });



                socket.on('print_order',function(obj){
                    var guid = obj.guid;
                    var client = clients.getById(guid);
                    if (typeof  client!=="object"){
                        console.log(' В print_order не определен client');
                        return;
                    }
                    client.print_order_callback = function () {
                        client.cSocket.emit('print_order');

                    };
                    clients.printOrder(client,{order_id:obj.order_id});

                });

                socket.on('print_ticket',function(obj){
                    var guid = obj.guid;
                    var client = clients.getById(guid);
                    if (typeof  client!=="object"){
                        console.log(' В print_ticket не определен client');
                        return;
                    }
                    client.print_ticket_callback = function (ticket_id) {
                        console.log('client.print_ticket_callback');
                        // TODO сделать обновление по билетно
                        client.cSocket.emit('print_ticket',ticket_id);

                    };
                    clients.printTicket(client,{ticket_id:obj.ticket_id});



                });





                console.log('client connected');
                socket.send("connection success");
                //console.log(socket);
                //if (io.sockets)
                ///// ДЛя зала

                //setUser
                function changeIntIndexToStrIndex(arr){
                    if (typeof arr!== "object") return false;
                    var s_data = {};
                    var count = 0;
                    for (var k in arr){
                        s_data['LINE'+k]=arr[k];
                        count++;
                    }
                    return {count:count,obj:s_data};
                }

                socket.on('setUser',function(guid,username,sid,page){
                    if (username==null || sid==undefined || !guid) return;

                    if (page!=="main"){
                        return;
                    }else{
                    }
                    var ip = socket.handshake.address.address;
                    console.log('++++++++++++++++++++++++++++ '+sid);
                    console.log('**********************'+username+'**********************');
                    var client = clients.getById(guid);
                    if (typeof client==="object"){
                        var mySock;

                        clients.update(guid,
                            {
                                user:username,
                                sid:sid,
                                cSocket:socket,
                                printers:[]
                            }
                        );

                    }else{
                        clients.update(guid,
                            {
                                user:username,
                                sid:sid,
                                cSocket:socket,
                                status:"NEW"
                            }
                        );
                    }
                    var checkPrinterConnectCount = 0;
                    function checkPrinterConnect(client){
                        if (typeof client!=="object"){
                            return;
                        }
                        if (checkPrinterConnectCount>10){
                            clients.update(guid,{
                                printers:[],
                                status:"NEW"
                            });
                            console.log('_________________________________Принтеры обнулены');
                            return;
                        }
                        if (client.pRes===0){
                            checkPrinterConnectCount++;
                            setTimeout(function(){
                                checkPrinterConnect(client);
                            },200);
                        }
                    }
                    clients.checkConnection(client);

                    checkPrinterConnect(client);
                    var clientSocks = client.clientSock;
                    for (var i in clientSocks) {
                        if (clientSocks[i]){
                            clientSocks[i].emit('init',sid);
                        }
                    }
                });

                socket.on('mapConnection',function(options){
                    //console.log(socket.manager);
                    //var room_type = (options.type=="get_action_scheme")? "action_scheme" : options.type;
                    var room = options.type+"_"+options.param+"_"+options.id;
                    //log(socket.manager.rooms);
                    var client_id = socket.id;
                    if (socket.manager.rooms["/"+room]!=undefined){
                        for (var c in socket.manager.rooms["/"+room]) if (socket.manager.rooms["/"+room][c]==client_id) return;
                    }
                    socket.join(room);
                    socket.emit('log',"you have joined room "+room);


                    function save(params,callback){
                        var o = self.cloneObj(options.save);
                        o.sid = options.sid;
                        if (params.command!=undefined) o.command = params.command;
                        if (params.object!=undefined) o.object = params.object;
                        o.params = (params.params!=undefined)? params.params : {};
                        var field_name = (params.field_name!==undefined) ? params.field_name : options.save.field_name;
                        delete o.field_name;

                        function query(items){
                            o.params[field_name] = items;
                            oracle.execute({o:o,callback:function (obj) {
                                start += count;
                                var tmpItems = params.list.slice(start,start+count);
                                if (tmpItems[0]!==undefined) {
                                    query(tmpItems);
                                }else{
                                    if (typeof callback==="function"){
                                        callback();
                                    }
                                }
                            }});

                        }

                        var start = 0;
                        var count = (params.portion!==undefined)?+params.portion:+options.portion;
                        var tmpItems = params.list.slice(start,start+count);
                        query(tmpItems);
                    }
                    function load(params,callback,callbackFull){
                        //io.sockets
                        var ok_ids = [];
                        var o = self.cloneObj(options.load);
                        o.sid = options.sid;
                        if (params.command!=undefined) o.command = params.command;
                        if (params.object!=undefined) o.object = params.object;
                        if (params.where!=undefined) o.where = params.where;
                        if (params.params!=undefined) o.params = params.params;
                        var field_name = (params.field_name!==undefined) ? params.field_name : options.save.field_name;
                        delete o.field_name;
                        var list = params.list;

                        function query(items){
                            //o.params[field_name] = items;

                            var where = field_name + " in ("+items.join(',')+")";
                            var count = items.length;
                            /*
                             for (var k in items){

                             if (k!=count-1)
                             where += field_name+" = "+items[k]+" or ";
                             else
                             where += field_name+" = "+items[k];
                             }*/
                            //o.where = (o.where!==undefined) ? o.where += " and "+where : where;
                            o.where = where;
                            //socket.emit('log',where);
                            log(o);
                            oracle.execute({o:o,callback:function (obj) {
                                console.log('');
                                console.log('----------------------------------------------------- Load_query_result:');
                                console.log('');
                                //console.log(obj);
                                log(obj);
                                var data = obj.resultJSON;
                                start += count;
                                var tmpItems = params.list.slice(start,start+count);
                                if (tmpItems[0]!==undefined){
                                    query(tmpItems);
                                }else{
                                    if (typeof callbackFull==="function"){
                                        callbackFull();
                                    }
                                }
                                if (typeof callback==="function"){
                                    callback(data);
                                }
                            }});

                        }
                        var start = 0;
                        var count2 = (params.portion!==undefined)?+params.portion:+options.portion;
                        var tmpItems = list.slice(start,start+count2);
                        query(tmpItems);
                    }


                    function add(params,callback,callbackFull){
                        var o = {
                            command:params.command,
                            object:params.object,
                            sid:options.sid
                        };
                        var ok_ids = [];
                        //var error_ids = [];

                        function query(items){
                            var count = items.length;
                            var o = {
                                command:params.command,
                                object:params.object,
                                sid:options.sid,
                                params:{}
                            };
                            var xml = "";
                            for (var i in items){
                                o.params = items[i];
                                xml += self.makeQuery(o);
                            }
                            log('add xml:');
                                log(xml);
                            oracle.execute({mode:'xml',xml:xml,callback:function (obj) {
                                log("add result");
                                log(obj);
                                var data = obj.resultJSON;
                                var rows = data['results'];
                                for (var k  in rows){
                                    ok_ids.push(rows[k].id);
                                }
                                //if (result.RC==0) ok_ids.push(result.ID);
                                start += count;
                                var tmpItems = params.objects.slice(start,start+count);
                                if (typeof callback==="function"){
                                    callback(data);
                                }
                                if (tmpItems[0]!==undefined){
                                    query(tmpItems);
                                }else{
                                    if (typeof callbackFull==="function"){
                                        callbackFull(ok_ids);
                                    }
                                }
                            }});

                        }

                        var start = 0;
                        var count2 = (params.portion!==undefined)?+params.portion:50;
                        var tmpItems = params.objects.slice(start,start+count2);
                        if (tmpItems[0]!==undefined)
                            query(tmpItems);
                    }


                    function edit(params,callback,callbackFull){
                        var o = {
                            command:"modify",
                            object:params.object,
                            sid:options.sid
                        };

                        function query(items){
                            var count = items.length;
                            var o = {
                                command:params.command,
                                object:params.object,
                                sid:options.sid,
                                params:{}
                            };
                            for (var k in items){
                                for (var i in items[k]){
                                    if (o.params[i]===undefined){
                                        o.params[i] = items[k][i];
                                    }else{
                                        o.params[i] += "|!|"+items[k][i];
                                    }
                                }
                            }


                            log('MODiFY object:');
                            log(o);
                            oracle.execute({o:o,callback:function (obj) {
                                var result = obj.resultJSON;
                                log('MODiFY result:');
                                log(result);
                                if (result.RC==0) {
                                    ok_ids.push(result.ID);
                                }
                                start += count;
                                var tmpItems = params.objects.slice(start,start+count);
                                if (typeof callback==="function"){
                                    callback(result);
                                }
                                if (tmpItems[0]!==undefined){
                                    query(tmpItems);
                                }else{
                                    if (typeof callbackFull==="function"){
                                        callbackFull();
                                    }
                                }

                            }});

                        }
                        //socket.emit('log',params);
                        var start = 0;
                        var count2 = (params.portion!==undefined)?+params.portion:50;
                        var tmpItems = params.objects.slice(start,start+count2);
                        if (tmpItems[0]!==undefined)
                            query(tmpItems);
                    }
                    function remove(params,callback,callbackFull){
                        var o = {
                            command:"remove",
                            object:params.object,
                            sid:options.sid
                        };

                        function query(items){
                            var count = items.length;
                            var o = {
                                command:params.command,
                                object:params.object,
                                sid:options.sid,
                                params:{}
                            };
                            for (var k in items){
                                for (var i in items[k]){
                                    if (o.params[i]===undefined){
                                        o.params[i] = items[k][i];
                                    }else{
                                        o.params[i] += "|!|"+items[k][i];
                                    }
                                }
                            }


                            log('REMOVE object:');
                            log(o);
                            oracle.execute({o:o,callback:function (obj) {
                                var result = obj.resultJSON;
                                log('REMOVE result:');
                                log(result);
                                if (result.RC==0) {
                                    ok_ids.push(result.ID);
                                }
                                start += count;
                                var tmpItems = params.objects.slice(start,start+count);
                                if (typeof callback==="function"){
                                    callback(result);
                                }
                                if (tmpItems[0]!==undefined){
                                    query(tmpItems);
                                }else{
                                    if (typeof callbackFull==="function"){
                                        callbackFull();
                                    }
                                }

                            }});

                        }
                        var start = 0;
                        var count2 = (params.portion!==undefined)?+params.portion:50;
                        var tmpItems = params.objects.slice(start,start+count2);
                        if (tmpItems[0]!==undefined)
                            query(tmpItems);
                    }
                    function get(params,callback,callbackFull){

                        var portion = params.portion || 50;
                        var count = 1;
                        function query(){
                            var o = {
                                command:params.command,
                                object:params.object,
                                sid:options.sid,
                                params:params.params || {}

                            };
                            o.params.page_no = count;
                            o.params.rows_max_num = portion;
                            o.params.where = params.params.where || "";

                            log("get obj:");
                            log(o);

                            oracle.execute({o:o,callback:function (obj) {
                                var data = obj.resultJSON;
                                var dataLength;
                                try {
                                    dataLength = data['data'].length;
                                } catch (e) {
                                    dataLength = 0;
                                }
                                if (dataLength>0){
                                    count++;
                                    query();
                                    if (typeof callback==="function"){
                                        callback(data);
                                    }

                                }else{
                                    if (typeof callbackFull==="function"){
                                        callbackFull();
                                    }
                                }

                            }});

                        }
                        query();
                    }



                    socket.removeAllListeners(room).on(room,function(obj){
                        if (typeof obj!=='object'){
                            if (obj==="leave"){
                                socket.emit('log',"you have left room "+room);
                                socket.leave(room);
                                return;
                            }

                            return;
                        }
                        socket.emit('log',obj);
                        var event = obj.event;
                        var save_params = obj.save_params || {};
                        var load_params = obj.load_params || {};

                        switch (event){
                            case "save_and_update":
                                save(save_params,function(){
                                    load(load_params,function(data){

                                            data = self.jsonToObj(data);
                                            //socket.to(room).emit(room+"_callback",data,"places");
                                            socket.emit(room+"_callback",data,"places");

                                        },function(){

                                            socket.emit(room+"_callbackFull");
                                            socket.broadcast.to(room).emit(room+"_callback",load_params.list,"ids");
                                        /*    var current_room = "get_action_scheme" + "_" + options.param + "_" + options.id;
                                            if (options.type=="action_scheme")
                                                socket.broadcast.to(current_room).emit(current_room+"_callback",load_params.list,"ids");*/
                                        }
                                    );
                                });

                                break;

                            case "save":
                                /* save(save_params,function(result){

                                 });*/

                                break;
                            case "load":

                                load(load_params,function(data){
                                        data = self.jsonToObj(data);
                                        //socket.to(room).emit(room+"_callback",data,"places");
                                        socket.emit(room+"_callback",data,"places");
                                       /* log("load:");
                                        log(data);*/
                                        //socket.broadcast.to(room).emit(room+"_callback",data,"places");
                                        //socket.emit(room+"_callback",data,"places");
                                        //io.sockets.in(room).emit(room+"_callback",data,"places");


                                    },function(){
                                        //log('load ready');
                                        //io.sockets.in(room).emit(room+"_callbackFull");

                                        //socket.broadcast.to(room).emit(room+"_callback",load_params.list,"ids");
                                    }
                                );


                                break;
                            case "add":
                                switch (obj.mode){
                                    case "squares":
                                        var obj_old_id = 0;
                                        if (obj.mode=="squares"){
                                            obj_old_id = obj.objects[0].object_id;
                                        }

                                        add(obj,function(data){




                                            var ids = [];
                                            var old_ids = [];
                                            var object_old_id = [];
                                            for (var i in data){
                                                ids.push(data[i].id);
                                                old_ids.push(data[i].old_id);
                                                object_old_id.push(data[i].object_old_id);

                                            }
                                            var res_obj = {
                                                id:ids,
                                                old_id:old_ids,
                                                object_old_id:object_old_id
                                            };
                                            socket.emit(room+"_add_callback_"+obj.mode,res_obj);
                                        },function(ok_ids){
                                            socket.emit(room+"_add_callbackFull_"+obj.mode,{ok_ids:ok_ids,object_old_id:obj_old_id});

                                        });

                                        break;
                                    default:
                                        add(obj,function(data){

                                            var ids = [];
                                            var old_ids = [];
                                            var object_old_id = [];
                                           /* for (var i in data){
                                                ids.push(data[i].id);
                                                old_ids.push(data[i].old_id);
                                                object_old_id.push(data[i].object_old_id);
                                            }*/
                                            var res_obj = {
                                                id:data.id,
                                                old_id:data.old_id,
                                                object_old_id:data.object_old_id
                                            };
                                            socket.emit(room+"_add_callback_"+obj.mode,res_obj);
                                        },function(result,ok_ids){
                                            socket.emit(room+"_add_callbackFull_"+obj.mode,ok_ids);

                                        });
                                        break;
                                }


                                break;
                            case "edit":
                                edit(obj,function(result){
                                    socket.emit(room+"_edit_callback"+obj.mode,result);
                                },function(result,ok_ids){
                                    socket.emit(room+"_edit_callbackFull"+obj.mode,result);
                                });

                                break;
                            case "remove":
                                remove(obj,function(result){

                                    socket.emit(room+"_remove_callback"+obj.mode,result);
                                },function(result,ok_ids){
                                    socket.emit(room+"_remove_callbackFull"+obj.mode,result);
                                });


                                /*remove(obj,function(result){

                                    data = result['results'];

                                    var ids = [];
                                    for (var i in data){
                                        ids.push(data[i].id);
                                    }
                                    var res_obj = {
                                        ids:ids
                                    };
                                    socket.emit(room+"_remove_callback_"+obj.mode,res_obj);
                                },function(){
                                    socket.emit(room+"_removeFull_callback_"+obj.mode);
                                });*/
                                break;
                            case "get":
                                get(obj,function(data){
                                    data  = self.jsonToObj(data);

                                    socket.emit(room+"_get_callback_"+obj.mode,data);
                                },function(){
                                    socket.emit(room+"_get_callbackFull_"+obj.mode);
                                });
                                break;
                            default:
                                break;
                        }
                    });
                });


                socket.on('getFile', function (obj) {
                    getFile(obj,function(err,fileName){
                        fileName = fileName.replace(/.+public_html/,'');
                        socket.json.send({mode:"getFile",fileName:fileName});
                    });
                });
                socket.on('getData', function (data) {
                    oracle.execute({o:data,callback:function (obj) {
                        var result = obj.result;
                        socket.json.send(result);
                    }});
                });
                socket.on('sendToAll', function (obj) {
                    if (typeof obj.users=="object"){
                        for (var i in obj.users) {
                            var clnt = clients.getByLogin(obj.users[i]);
                            if (clnt){
                                console.log('Message sended to', obj.users[i]);
                                clnt.cSocket.emit('sendToAll',obj);
                            }else{
                                if (typeof clients.message_stack[obj.users[i]]!=="object"){
                                    clients.message_stack[obj.users[i]] = [];
                                }
                                console.log('Message added to stack for', obj.users[i]);
                                clients.message_stack[obj.users[i]].push(obj);
                            }
                        }
                        return;
                    }
                    //socket.json.send({mode:"sendToAll",message:obj.message,type:obj.type});
                    io.sockets.emit('sendToAll',obj);

                });
                socket.on('socketQuery', function (data,callback_id,type) {
                    var ip = socket.handshake.address.address;
                    var t1 = nowTime();
                    var s = t1.time+" Пришел запрос на Node.js";
                    //socket.emit('log','Start: '+d);
                    data.in_out_key=socket.id;
                    socket.emit('log','S: '+socket.id);2
                    var xml = self.makeQuery(data);
                        log(xml);

                    oracle.execute({o:data,callback:function (obj,data) {
                        //console.log(obj.io_key);
                        var io_key = obj.io_key;

                        var socket2 = io.sockets.sockets[io_key];




                        var result = obj.result;
                        var response = obj.resultJSON;
                        if (response.code && response.code!=0){
                            var clnt = clients.getById('F1687B15-2FA1-4F25-8561-37A3EBCC3AFE3');
                            if (clnt){
                                if (clnt.cSocket !== 0){
                                    clnt.cSocket.emit('logBody',response.toastr.message);
                                }
                            }
                            //log(response.toastr.message);
                        }

                        var t2 = nowTime();
                        s += "\n"+t2.time+" Запрос выполнен.";
                        try {
                            s += "\n Размер: " + result.length * 8 / 1024;
                        } catch (e) {
                        }
                        s += "\nРазность: "+(t2.timestamp-t1.timestamp)+"\n______________________________________________\n";
                        sendTime(s);
                        try {
                            socket.emit('socketQueryCallback', callback_id, result);
                        } catch (e) {
                            console.log('socketQuery can`t emit');
                            //process.exit(1);
                        }


                        var rc;
                        try {
                            rc = +response.code;
                        } catch (e) {
                            return;
                        }
                        if (rc !== 0 || response.login===undefined) return;
                        var username = response.login;
                        var sid = response.sid;
                        var guid = response.guid;
                        var client = clients.getById(guid);
                        /*var client = clients.getById(guid);
                        if (typeof client!=="object"){
                            client = {
                                sid:sid
                            }
                        }
    */
                        if (typeof client=="object"){
                            clients.getUserPacks(client);

                        }



                        //return;



                    }});

                });

                 /*   "JKiXDEU6CVNKY07Pe-SF"
                    "A8Dyyw5BvfNmeYzDff0P"
    */
                var delivery = dl.listen(socket);
                delivery.on('receive.success',function(file){
//                    file.name = decodeURI(file.name);
                    //file.name
                    fs.writeFile(config.deliveryPath+file.name,file.buffer, function(err){
                        if(err){
                            console.log('File could not be saved.');
                        }else{
                            console.log('File saved.');
                        }
                    });
                });

                socket.on('disconnect', function () {
                    delete socket.namespace.sockets[socket.id];
                    var count = countObj(socket.namespace.sockets);
                    console.log('disconnect count:');
                    console.log(count);

                    var client = clients.getByCSocketId(socket.id);
                    if (!client){
                        return;
                    }
                    clients.remove(client.id,
                        {
                            cSocket:0
                        }
                    );

                    var rooms = socket.manager.roomClients[socket.id];
                    for(var room in rooms) {
                        if ((room != '') && (rooms[room])) {
                            /*removing a slash*/
                            room = room.substring(1);
                            socket.leave(room);
                            //that.__io.sockets.in(room).emit('leave', { room : room, id : socket.id });
                        }
                    }
                    //console.log(client);
                });


                /*socket.on('news', function (data) {
                 console.log(data);
                 socket.emit('news',{news: data.back});
                 });

                 */
        });

    },

    makeQuery:function (options, callback) {
        var xml = "<query>";
        //if (options && typeof options === "object" && options.object && options.command) {
        if (options && typeof options === "object"  && options.command)  {
            if (options.hasOwnProperty("params")) {
                for (var key in options.params) {
                    xml += "<" + key + ">" + options.params[key] + "</" + key + ">";
                }
                //delete options.params;
            }
            for (var key in options) {
                if (key=="params") continue;
                xml += "<" + key + ">" + options[key] + "</" + key + ">";
            }
            xml += "</query>";
        }
        return xml;
    },
    jsonToObj:function(obj){
        var obj_true = {};
        var objIndex = {};
        for (i in obj['data']){
            for(var index in obj['data_columns']){
                if(obj_true[i] == undefined){obj_true[i] = {};}
                obj_true[i][obj['data_columns'][index]] = obj['data'][i][index];
            }
        }
        return obj_true;
    },

    cloneObj:function(obj){
        if(obj == null || typeof(obj) != 'object'){
            return obj;
        }
        var temp = {};
        for(var key in obj){
            temp[key] = this.cloneObj(obj[key]);
        }
        return temp;
    },
    guid:function() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            var r, v;
            r = Math.random() * 16 | 0;
            v = (c === "x" ? r : r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
    }
};
server.init();



