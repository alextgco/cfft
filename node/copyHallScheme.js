var fs = require('fs');
var toFile = require('./saveToFile').toFile;
var oracle = require('./oracle2');
var logF = require('./my_log').logF;
var funcs = require('./functions').functions;
var config = require('./config');
var clients = require('./clients').clients;


var checkCode = function (obj) {
    var res = obj.resultJSON;
    if (res.code) {
        client.cSocket.emit('log', res.code);
        return false;
    }
    return funcs.jsonToObj(res);
};

var exportToJSON = function(obj,client){
    if (typeof obj!="object"){
        console.log('В exportToJSON не передан obj');
        return;
    }
    if (typeof client!='object'){
        console.log('В exportToJSON не передан client');
        return;
    }
    var hall_scheme_id = obj.id;
    var sid = client.sid;
    if (!hall_scheme_id || !sid){
        console.log('Не передан id схемы (obj.id) или sid (client.sid)');
        return;
    }
    var file_name = obj.file_name || 'hall_scheme_'+hall_scheme_id+'('+config.host+')';
    var hall_scheme = {
        HALL_SCHEME_ID:hall_scheme_id,
        items:{},
        layers:{},
        objects:{},
        file_list:{},
        area_group:{}
    };


    var loadCounter = 0;

    var checkAllLoaded = function () {
        loadCounter++;
        var number = 5;
        var check =  (loadCounter == number);
        if (check){
            client.cSocket.emit('log','hall_scheme');
            client.cSocket.emit('log',hall_scheme);
            client.cSocket.emit('log','exportToJSON END');
            /*try {*/
                var fileName = file_name + '.json';
            var data = JSON.stringify(hall_scheme);
            toFile({fileName: fileName, flags:"w", data: data},function(err){
                    if (err){
                        console.log(err);
                        process.exit();
                    }
                });
                //toFile({fileName: fileName, flags:"w", data: JSON.stringify(hall_scheme)});
                client.cSocket.emit('log','Сохранено в '+fileName);
            /*} catch (e) {
                client.cSocket.emit('log','Не удалось сохранить в '+fileName);
            }*/
        }
    };
    var o = {
        command: "get",
        object: "hall_scheme",
        sid: sid,
        params: {
            where: 'hall_scheme_id = '+hall_scheme_id
        }
    };

    oracle.execute({
        o: o, callback: function (obj) {
            var data = checkCode(obj);
            if (!data){
                return;
            }
            if (data.length==0){
                client.cSocket.emit('log','Нет такой схемы');
                return;
            }
            data = data[0];

            for (var i in data) {
                if (i.indexOf('_ID')!=-1 && i!=='HALL_SCHEME_ID'){
                    continue;
                }
                hall_scheme[i] = data[i];
            }
            var o = {
                command: "get",
                object: "hall_scheme_layer",
                sid: sid,
                columns:'HALL_SCHEME_LAYER_ID,NAME,VISIBLE_EDITOR,VISIBLE_ADMIN,VISIBLE_CASHER,VISIBLE_IFRAME,VISIBLE_CLIENT_SCREEN,VISIBLE_SECTOR,SORT_NO',
                params: {
                    where: 'hall_scheme_id = '+hall_scheme_id
                }
            };
            oracle.execute({
                o: o, callback: function (obj) {
                    var data = checkCode(obj);
                    if (!data){
                        return;
                    }
                    hall_scheme.layers = data;
                    checkAllLoaded();
                }
            });
            var o2 = {
                command: "get",
                object: "hall_scheme_object",
                sid: sid,
                columns: 'HALL_SCHEME_OBJECT_ID,HALL_SCHEME_LAYER_ID,OBJECT_TYPE,NAME,VISIBLE_EDITOR,VISIBLE_ADMIN,VISIBLE_CASHER,VISIBLE_IFRAME,VISIBLE_CLIENT_SCREEN,VISIBLE_SECTOR,VALUE,ROTATION,FONT_FAMILY,FONT_SIZE,FONT_STYLE,FONT_WIEGH,COLOR,X,Y,SCALE,OPACITY,BACKGROUND_COLOR,BACKGROUND_URL_ORIGINAL,BACKGROUND_URL_SCALE,SORT_NO,USER_CAN_SPLIT_PLACES',
                params: {
                    where: 'hall_scheme_id = '+hall_scheme_id
                }
            };
            oracle.execute({
                o: o2, callback: function (obj) {
                    var data = checkCode(obj);
                    if (!data){
                        return;
                    }
                    hall_scheme.objects = data;
                    checkAllLoaded();
                }
            });
            var o3 = {
                command: "get",
                object: "hall_scheme_item",
                sid: sid,
                columns:'HALL_SCHEME_ITEM_ID,PLACE_TITLE,PLACE,LINE_TITLE,LINE,PLACE_COMMENT,STATUS,X,Y,W,H,ROTATION,AREA_GROUP_ID,AREA_GROUP_NAME,COLOR,HALL_SCHEME_OBJECT_ID,PLACE_GROUP_ID',
                params: {
                    hall_scheme_id: hall_scheme_id
                }
            };
            oracle.execute({
                o: o3, callback: function (obj) {
                    var data = checkCode(obj);
                    if (!data){
                        return;
                    }
                    hall_scheme.items = data;
                    checkAllLoaded();
                }
            });
            var o4 = {
                command: "get",
                object: "hall_scheme_file_list",
                sid: sid,
                columns:'HALL_SCHEME_FILE_LIST_ID,FILENAME,EXTENTION',
                params: {
                    where: 'hall_scheme_id = '+hall_scheme_id
                }
            };
            oracle.execute({
                o: o4, callback: function (obj) {
                    var data = checkCode(obj);
                    if (!data){
                        return;
                    }
                    hall_scheme.file_list = data;
                    checkAllLoaded();
                }
            });
            var o5 = {
                command: "get",
                object: "hall_scheme_area_group",
                sid: sid,
                columns:'AREA_GROUP_ID,NAME,COMMENTS,COLOR,AREA_GROUP_STROKE',
                params: {
                    where: 'hall_scheme_id = '+hall_scheme_id
                }
            };
            oracle.execute({
                o: o5, callback: function (obj) {
                    var data = checkCode(obj);
                    if (!data){
                        return;
                    }
                    hall_scheme.area_group = data;
                    checkAllLoaded();
                }
            });
        }
    });

  // client.cSocket.emit('log','exportToJSON END');


};


var importFromJSON = function(obj,client) {
    if (typeof obj != "object") {
        console.log('В importFromJSON не передан obj');
        return;
    }
    if (typeof client != 'object') {
        console.log('В importFromJSON не передан client');
        return;
    }
    var sid = client.sid;
    if (!sid) {
        console.log('Не передан sid (client.sid)');
        return;
    }
    var hall_id = obj.hall_id;
    if (!hall_id) {
        console.log('Не передан hall_id (obj.hall_id)');
        return;
    }
    var file_name = obj.file_name;
    if (!file_name){
        console.log('Не передан file_name (obj.file_name)');
        return;
    }
    fs.exists(file_name, function (exists) {
        if (!exists){
            client.cSocket.emit('log',file_name+' не существует');
            return;
        }
        var s = '';
        var hall_scheme;
        var stream = fs.ReadStream(file_name,{encoding:'utf-8'});
        stream.on('readable',function(){
            s += stream.read();
        });
        stream.on('end',function(){
            try {
                hall_scheme = JSON.parse(s);
            } catch (e) {
                client.cSocket.emit('log','Не корректный формат JSON в файле '+file_name);
                return;
            }
            if (typeof hall_scheme.items!=='object' ||
                typeof hall_scheme.layers!=='object' ||
                typeof hall_scheme.objects!=='object' ||
                typeof hall_scheme.file_list!=='object'){
                client.cSocket.emit('log','Не корректные данные в файле '+file_name);
                return;
            }
            /// Выполняем заливку в базу
            var d = new Date().toLocaleString();
            var o = {
                command: "new",
                object: "hall_scheme",
                sid: sid,
                params: {
                    hall_id:hall_id,
                    name:obj.name || '('+hall_scheme.HALL_SCHEME_ID+')Импортировано_'+ d
                }
            };
            oracle.execute({o:o,callback:function(result){
                var res = result.resultJSON;
                if (+res.code!==0){
                    client.cSocket.emit('log','Ошибка при создании схемы зала.'+ res.toastr.message);

                    return;
                }
                hall_scheme.HALL_SCHEME_ID_NEW = res.id;
                /// Заведем Слои
                var hallschemeidnew = hall_scheme.HALL_SCHEME_ID_NEW;
                var layerERR = false;
                var objectERR = false;
                var itemERR = false;

                var layerEND = false;

                var loadAreaGroups = function (callback) {
                    if (typeof callback!=="function"){
                        callback = function(){};
                    }
                    var counter = 0;
                    var area_group_count = 0;
                    for (var i01 in hall_scheme.area_group){
                        area_group_count++;
                    }
                    for (var i0 in hall_scheme.area_group) {

                        var area_group = hall_scheme.area_group[i0];
                        var o0 = {
                            command: "new",
                            object: "hall_scheme_area_group",
                            sid: sid,
                            old_id:i0,
                            params: area_group
                        };
                        o0.params.HALL_SCHEME_ID = hallschemeidnew;

                        oracle.execute({
                            o: o0, callback: function (result) {
                                counter++;
                                var res = result.resultJSON;
                                if (+res.code !== 0) {
                                    client.cSocket.emit('log', 'Ошибка при создании area_group.' + res.toastr.message);
                                    itemERR = true;
                                    return;
                                }
                                var areaGroupNum= res.old_id;
                                var areaGroup = hall_scheme.area_group[areaGroupNum];
                                for (var i in hall_scheme.items) {
                                    var item = hall_scheme.items[i];
                                    if (item.AREA_GROUP_ID == areaGroup.AREA_GROUP_ID){
                                        item.AREA_GROUP_ID = res.id;
                                    }
                                }
                                if (area_group_count==counter){
                                    callback();
                                }
                            }
                        });
                    }
                    if (area_group_count==0){
                        callback();
                    }
                };
                loadAreaGroups(function(){
                    for (var l in hall_scheme.layers) {
                        if (layerERR || objectERR || itemERR){
                            client.cSocket.emit('log','Ошибка при создании слоя или объекта или места. Процесс завершен. Удалите схему.');
                            break;
                        }
                        var o = {
                            command: "new",
                            object: "hall_scheme_layer",
                            sid: sid,
                            old_id:l,
                            params: hall_scheme.layers[l]
                        };
                        o.params.HALL_SCHEME_ID = hallschemeidnew;
                        oracle.execute({o:o,callback:function(result){
                            var res = result.resultJSON;
                            if (+res.code!==0){
                                client.cSocket.emit('log','Ошибка при создании слоя.'+ res.toastr.message);
                                layerERR = true;
                                return;
                            }
                            var layer_num = res.old_id;
                            var layer = hall_scheme.layers[layer_num];
                            layer.HALL_SCHEME_LAYER_ID_NEW = res.id;
                            for (var i in hall_scheme.objects) {
                                var object = hall_scheme.objects[i];
                                if (object.HALL_SCHEME_LAYER_ID==layer.HALL_SCHEME_LAYER_ID){
                                    var o = {
                                        command: "new",
                                        object: "hall_scheme_object",
                                        sid: sid,
                                        params: object
                                    };
                                    o.params.HALL_SCHEME_ID = hallschemeidnew;
                                    o.params.HALL_SCHEME_LAYER_ID = layer.HALL_SCHEME_LAYER_ID_NEW;
                                    //delete hall_scheme.objects[i];
                                    oracle.execute({o:o,callback:function(result) {
                                        var res = result.resultJSON;
                                        if (+res.code !== 0) {
                                            client.cSocket.emit('log', 'Ошибка при создании объекта.' + res.toastr.message);
                                            objectERR = true;
                                            return;
                                        }
                                    }});
                                }

                            }
                            client.cSocket.emit('log','layer_num '+ layer_num);

                        }});
                        // Добавим объекты не принадлежашие слоям (PLACE_GROUP)
                        for (var i in hall_scheme.objects) {
                            var object = hall_scheme.objects[i];
                            if (object.HALL_SCHEME_LAYER_ID!==''){
                                continue;
                            }
                            var o2 = {
                                command: "new",
                                object: "hall_scheme_object",
                                old_id:i,
                                sid: sid,
                                params: object
                            };
                            o2.params.HALL_SCHEME_ID = hallschemeidnew;
                            oracle.execute({
                                o: o2, callback: function (result) {
                                    var res = result.resultJSON;
                                    if (+res.code !== 0) {
                                        client.cSocket.emit('log', 'Ошибка при создании объекта.' + res.toastr.message);
                                        objectERR = true;
                                        return;
                                    }
                                    var object_num = res.old_id;
                                    var object = hall_scheme.objects[object_num];
                                    var obj_id = res.id;
                                    for (var j in hall_scheme.items) {
                                        var item = hall_scheme.items[j];

                                        if (item.HALL_SCHEME_OBJECT_ID == object.HALL_SCHEME_OBJECT_ID) {
                                            var o2 = {
                                                command: "new",
                                                object: "hall_scheme_item",
                                                sid: sid,
                                                params: item
                                            };
                                            o2.params.HALL_SCHEME_ID = hallschemeidnew;
                                            o2.params.HALL_SCHEME_OBJECT_ID = obj_id;
                                            //delete hall_scheme.objects[object_num];
                                            oracle.execute({
                                                o: o2, callback: function (result) {
                                                    var res = result.resultJSON;
                                                    if (+res.code !== 0) {
                                                        client.cSocket.emit('log', 'Ошибка при создании места.' + res.toastr.message);
                                                        itemERR = true;
                                                        return;
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        }

                    }


                    /// Создадим оставшиеся места (у кот. нет привязки к объекту)
                    for (var j in hall_scheme.items) {
                        var item = hall_scheme.items[j];
                        if (item.HALL_SCHEME_OBJECT_ID!==''){
                            continue;
                        }

                        var o3 = {
                            command: "new",
                            object: "hall_scheme_item",
                            sid: sid,
                            params: item
                        };
                        o3.params.HALL_SCHEME_ID = hallschemeidnew;
                        oracle.execute({
                            o: o3, callback: function (result) {
                                var res = result.resultJSON;
                                if (+res.code !== 0) {
                                    client.cSocket.emit('log', 'Ошибка при создании места.' + res.toastr.message);
                                    itemERR = true;
                                    return;
                                }
                            }
                        });
                    }
                });





                //client.cSocket.emit('log',hallschemeidnew);
            }});

            /*client.cSocket.emit('log',hall_scheme);*/
            client.cSocket.emit('log','OK');

        });
        stream.on('error',function(){
            client.cSocket.emit('log','Ошибка при чтении файла '+file_name);
        });

    });


};

module.exports.exportToJSON = exportToJSON;
module.exports.importFromJSON = importFromJSON;
