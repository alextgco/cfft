var config = require('./config.js');
var oracle = require('oracle-changed');
var clients = require('./clients');
var nowTime = function(){
    var d = new Date();
    return {
        time:d,
        timestamp:d.getTime()
    };
};
var ora = {
    connectData:config.connectData,
    connectionsLimit:config.connectionsLimit || 10,
    querysLimit:config.querysLimit || 10000,
    connectionCount:0,
    querys:[],

    init:function(){

    },
    connect:function(callback){
        var self = this;
        oracle.connect(this.connectData, function(err, connection) {
            if (err) { console.log("Error connecting to db:", err); return false; }
            self.connectionCount++;
            if (typeof callback==='function'){
                callback(connection);
            }

            return true;
        });
    },
    disconnect:function(connection){
        connection.close();
        this.connectionCount--;
        if (this.connectionCount<this.connectionsLimit){
            this.execute({mode:'stack'});
        }
        console.log('--- oracleDisconnect Всего: '+this.connectionCount+'  Очередь: '+this.querys.length);
    },
    //execute:function(object,callback,mode,data){
    execute:function(object){
        var self = ora;
        var o = object.o || {};
        var xml = object.xml || '';
        var mode = object.mode || 'normal';
        var data = object.data || {};
        var callback = (typeof object.callback==="function")? object.callback : function(){};
        var ip = '';
        var query;
        if (mode==='normal'){
            query = self.makeQuery(o);
        }else if (mode==='xml'){
            query = xml;
        }else if (mode==='stack'){
            // Очередь запросов пуста или все еще нет свободных подключений
            if (self.querys.length===0 || self.connectionCount>=self.connectionsLimit){
                /// Очередь пуста
                return;
            }
            var item = self.querys.shift();
            query = item.query;
            callback = item.callback;
        }
        //console.log(query);

        /** Подключаемся к базе **/
        if (self.connectionCount>=self.connectionsLimit){
            if (self.querys.length>=self.querysLimit){
                callback({
                    result:'{ "results": [ {"code":"oracleExecuteError","object":"oracleExecute","toastr":{"type":"error","title":"","message":"Превышен лимит запросов в очереди "}}] }',
                    resultJSON:{ "results": [ {"code":"oracleExecuteError","object":"oracleExecute","toastr":{"type":"error","title":"","message":"Превышен лимит запросов в очереди "}}] }
                },data);
                return;
            }else{
                self.querys.push({o:o,query:query,callback:callback});
                return;
            }
        }
        self.connect(function(connection){
            //console.log(query);

            connection.execute("declare begin :res := TICKET_B2C.b2e_gateway_api.Request(:xreq,'"+ip+"'); end;", [new oracle.OutParam(oracle.OCCICLOB),query],
                function (err, result) {



                    if (err) {
                        console.log("Error executing query:", err);
                        if (typeof callback==="function")
                            callback({
                                result:'{ "results": [ {"code":"oracleExecuteError","object":"oracleExecute","toastr":{"type":"error","title":"","message":"Сервер вернул ошибку: "}}] }',
                                resultJSON:{ "results": [ {"code":"oracleExecuteError","object":"oracleExecute","toastr":{"type":"error","title":"","message":"Сервер вернул ошибку: "}}] }
                            },data);
                        self.disconnect(connection);
                        return;
                    }
                    var res;
                    var io_key = '';
                    setTimeout(function(){
                        try {
                            res = JSON.parse(result.returnParam);
                            io_key = res.in_out_key;
                            delete  res.in_out_key;
                            try {
                                if (res['results'][0].code && +res['results'][0].code !== 0) {
                                    console.log(data['results'][0].toastr.message);

                                    if (typeof client !== "object") {
                                        return;
                                    }

                                    self.disconnect(connection);
                                    return;
                                }
                                res = res['results'][0];
                            } catch (e) {

                            }
                        } catch (e) {

                            console.log('Сервер вернул не верный формат JSON');
                            console.log(result.returnParam);

                            res = { "results": [ {"code":"oracleExecuteError","object":"oracleExecute","toastr":{"type":"error","title":"","message":"Сервер вернул не верный формат JSON"}}] };
                        }


                        if (typeof callback==="function"){
                            callback({result:result.returnParam,resultJSON:res,io_key:io_key},data);
                        }
                    },0);



                    self.disconnect(connection);

                }
            );
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
        var i;
        var obj_true = {};
        var objIndex = {};
        for (i in obj['data']){
            for(var index in obj['data_columns']){
                if(obj_true[i] == undefined){obj_true[i] = {};}
                obj_true[i][obj['data_columns'][index]] = obj['data'][i][index];
            }
        }
        return obj_true;
    }
};
exports.execute = ora.execute;
/*

oracle.execute({o:o,callback:function (obj) {
    //var data = obj.resultJSON;
    var data = self.jsonToObj(obj.resultJSON);
}});*/
