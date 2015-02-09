// note, io.listen(<port>) will create a http server for you
var io = require('socket.io').listen(8080);
var oracle = require('oracle');
var dl  = require('delivery');
var fs  = require('fs');

function findInArray(arr,value){
    if (typeof arr!=="object") return false;
    for (var k in arr)
      if (arr[k]==value) return true;
    return false;
}

var server = {
    connectData:{
        hostname: "192.168.1.101",
        port: 1521,
        database: "PDBORCL", // System ID (SID)
        user: "ticket_b2c",
        password: "qweqwe"
    },
    connection:null,
    init:function(){
        var self = this;
        var mapConnections = [];
        this.oracleConnect(function(){
            io.sockets.on('connection', function (socket) {
                ///// ДЛя зала
                socket.on('mapConnection',function(options){
                    var room = options.type+"_"+options.param+"_"+options.id;

                    socket.join(room);

                    socket.on(room,function(obj){
                        // сохраняем изменения

                        var saveAndUpdate = function(items){

                            obj.params[field_name] = items.join(',');
                            var xml = self.makeQuery(obj);
                            self.oracleExecute(xml,function(result){
                                var param = {};
                                param[options.param] = options.id;
                                param.columns = field_name+",PRICE,STATUS,STATUS_TEXT,FUND_GROUP_NAM,PRICE_GROUP_NAME,BLOCK_COLOR,COLOR";
                                param.where = (param.where!=undefined)?param.where+" and " : "";
                                var count = items.length-1;
                                for (var k in items){
                                    if (k!=count)
                                        param.where += field_name+" = "+items[k]+" or ";
                                    else
                                        param.where += field_name+" = "+items[k];
                                }
                                var o = {
                                    command:"get",
                                    object:options.type,
                                    sid:obj.sid,
                                    params:param
                                };

                                var xml2 = self.makeQuery(o);
                                self.oracleExecute(xml2,function(result2){
                                    var data = JSON.parse(result2);
                                    data = self.jsonToObj(data);
                                    io.sockets.in(room).emit(room+"_callback",data);
                                });
                            });
                        };


                        var list = obj.list;
                        var field_name = Object.keys(list)[0];
                        var items = list[field_name];
                        delete obj.list;
                        var start = 0;
                        var count = 40;
                        obj.object += "_by_list";
                        while (items[start]!==undefined){
                            var newItems = items.slice(start,start+count);
                            saveAndUpdate(newItems);
                            start += count;
                        }





                       /* var list = obj.list;
                        var field_name = Object.keys(list)[0];
                        var items = list[field_name];
                        delete obj.list;
                        for (var k in items){

                            obj.params[field_name] = items[k];
                            var xml = self.makeQuery(obj);
                            self.oracleExecute(xml,function(result){
                                result = JSON.parse(result);
                                var param = {};
                                param[options.param] = options.id;
                                param.where = result.FIELD_NAME+" = "+result.ID;
                                var o = {
                                    command:"get",
                                    object:options.type,
                                    sid:obj.sid,
                                    params:param
                                };
                                var xml2 = self.makeQuery(o);
                                self.oracleExecute(xml2,function(result2){
                                    var data = JSON.parse(result2);
                                    io.sockets.in(room).emit(room+"_callback",data);
                                });

                            });
                        }*/


                    });

                    //if (mapConnections.indexOf(options.type,))
                });


                /*socket.on('socketMAP', function (data) {
                    var xml = self.makeQuery(data);
                    self.oracleExecute(xml,function(result){
                        var id = result.ID;
                        if (!isNaN(+id)){
                            var o = {

                            };
                            var xml = self.makeQuery(data);
                            self.oracleExecute(xml,function(result){

                            });
                        }
                        //io.sockets.emit('updateSquare',id);
                    });
                });*/

                socket.on('getData', function (data) {
                    var xml = self.makeQuery(data);
                    self.oracleExecute(xml,function(result){
                        //result = eval(result);
                        //result = JSON.parse(result);
                        socket.json.send(result);
                        //socket.json.send({'event':'log','name':"sds",'age':'15'});
                        //socket.emit('log',result);
                    });
                });
                socket.on('socketQuery', function (data) {
                    var xml = self.makeQuery(data);
                    self.oracleExecute(xml,function(result){
                        //console.log(result);
                        result = JSON.parse(result);
                        socket.emit('socketQueryCallback',result);
                    });
                });



                var delivery = dl.listen(socket);
                delivery.on('receive.success',function(file){
                    fs.writeFile('upload/'+file.name,file.buffer, function(err){
                        if(err){
                            console.log('File could not be saved.');
                        }else{
                            console.log('File saved.');
                        }
                    });
                });


                /*socket.on('news', function (data) {
                    console.log(data);
                    socket.emit('news',{news: data.back});
                });

                socket.on('disconnect', function () {
                    io.sockets.emit('user disconnected');
                });*/
            });

        });

    },
    oracleConnect:function(callback){
        var self = this;
        oracle.connect(this.connectData, function(err, connection) {
            if (err) { console.log("Error connecting to db:", err); return; }
            self.connection = connection;
            if (typeof callback==="function"){
                callback();
            }
        });
    },
    oracleDisconnect:function(callback){
        this.connection.close();
        if (typeof callback==="function"){
            callback();
        }
    },
    oracleExecute:function(query,callback){
        if (!this.connection.isConnected()) return;
        /*this.connection.execute("SELECT * FROM nls_database_parameters",[],function(err,result){
            console.log(err);
            console.log(result);
        });
*/
        //console.log(query);
        this.connection.execute("declare begin :res := TICKET_B2C.b2c_gateway_api.Request(:xreq); end;", [new oracle.OutParam(oracle.OCCICLOB),query],
            function (err, result) {
                if (err) {
                    console.log("Error executing query:", err);
                    return;
                }
                if (typeof callback==="function"){
                    callback(result.returnParam);
                }
            }
        );
    },
    makeQuery:function (options, callback) {
        var xml = "<query>";
        if (options && typeof options === "object" && options.object && options.command) {
            if (options.hasOwnProperty("params")) {
                for (var key in options.params) {
                    xml += "<" + key + ">" + options.params[key] + "</" + key + ">";
                }
                //delete options.params;
            }
            for (var key in options) {
                if (key=="params") break;
                xml += "<" + key + ">" + options[key] + "</" + key + ">";
            }
            xml += "</query>";
        }
        return xml;
    },
    jsonToObj:function(obj){
        var obj_true = {};
        var objIndex = {};
        for (i in obj['DATA']){
            for(var index in obj['NAMES']){
                if(obj_true[i] == undefined){obj_true[i] = {};}
                obj_true[i][obj['NAMES'][index]] = obj['DATA'][i][index];
            }
        }
        return obj_true;
    }
};
server.init();



