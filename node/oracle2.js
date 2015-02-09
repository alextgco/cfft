
var config = require('./config.js');
var clients = require('./clients');
var exec = require('child_process').exec,
    child;

//var oracle = require('oracle-changed');
var http = require('http');
var querystring = require('querystring');
var logF = require('./my_log').logF;
var nowTime = function(){
    var d = new Date();
    return {
        time:d,
        timestamp:d.getTime()
    };
};
var myCount= 0;






var ora = {
    connectData:config.connectData,
    connectionsLimit:config.connectionsLimit || 100,
    querysLimit:config.querysLimit || 10000,
    connectionCount:0,
    querys:[],

    init:function(){
    },
    connect:function(callback){
        this.connectionCount++;
        if (typeof callback==='function'){
            callback();
        }
    },
    disconnect:function(){
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
        var output_format = o.output_format;
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
        query = query.replace(/"/g, "\\\"");
        console.log('execute start '+ query);
        if (self.connectionCount>=self.connectionsLimit){
            if (self.querys.length>=self.querysLimit){
                logF("Превышен лимит запросов в очереди ");
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
        self.connect(function(){
            var t1 = new Date().getTime();
            child = exec('perl '+config.perlScript+' "'+query+'"',
                { encoding: 'utf8',
                    timeout: 0,
                    maxBuffer: 524288 * 20,
                    killSignal: 'SIGTERM',
                    cwd: null,
                    env: null
                },
                function (error, stdout, stderr) {
                    self.disconnect();
                    /*console.log('stdout: ' + stdout.length);
                     console.log('stderr: ' + stderr);*/
                    if (error !== null) {
                        console.log('exec error: ' + error);
                        logF('exec error: ' + error);
                    }
                    /*console.log(stdout);
                    console.log('execute stop');*/
                    if (output_format){
                        if (typeof callback==="function") {
                            callback({result:stdout},data);
                        }
                        return;
                    }
                    try {
                        res = JSON.parse(stdout);
                        //res = {};
                        io_key = res.in_out_key;
                        delete  res.in_out_key;
                        try {
                            if (res['results'][0].code && +res['results'][0].code !== 0) {
                                console.log(res['results'][0].toastr.message);
                            }
                            res = res['results'][0];
                        } catch (e) {
                        }
                    } catch (e) {
                        console.log('Сервер вернул не верный формат JSON');
                        console.log(stdout);
                        logF('Сервер вернул не верный формат JSON:');
                        logF(stdout);
                        res = { "results": [ {"code":"oracleExecuteError","object":"oracleExecute","toastr":{"type":"error","title":"","message":"Сервер вернул не верный формат JSON"}}] };
                    }
                    if (typeof callback==="function"){
                        callback({result:stdout,resultJSON:res,io_key:io_key},data);
                        //callback({result:pageData,resultJSON:res,io_key:io_key},data);
                    }
                    var t2 = new Date().getTime();
                    console.log('time');
                    console.log(t2-t1);
                });
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


