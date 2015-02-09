socketQuery = function(obj,callback){
    console.log("Socket",obj);
    if (typeof callback==="function")
        var id = socketQuery_stack.addItem(callback);
    socket.emit('socketQuery',obj,id);
};
makeQuery = function (options, callback) {
    var xml = "<query>";
    if (options && typeof options === "object"  && options.command) {
        if (options.hasOwnProperty("params")) {
            for (var key in options.params) {
                xml += "<" + key + ">" + options.params[key] + "</" + key + ">";
            }
            delete options.params;
        }
        for (var key in options) {
            xml += "<" + key + ">" + options[key] + "</" + key + ">";
        }
        xml += "</query>";
    }
    return xml;
};
/*sendQuery = function(params, callback){
    var url = "/cgi-bin/b2e";
    var xml = params;
    if (typeof params=="object")
        xml = makeQuery(params);
    $.post(url,{request:xml},function(data){
        if (typeof callback=="function"){
            data = $.parseJSON(data);
            callback(data);
        }
    });
};*/
//sendQuery = socketQuery;
sendQuery = function (options, callback) {
    var url = "/cgi-bin/b2e", xml = "<query>";
    if (options && typeof options === "object" && options.command) {
        if (options.hasOwnProperty("params")) {
            for (var key in options.params) {
                xml += "<" + key + ">" + options.params[key] + "</" + key + ">";
            }
            delete options.params;
        }
        for (var key in options) {
            xml += "<" + key + ">" + options[key] + "</" + key + ">";
        }
        xml += "</query>";
    }
    $.getJSON(url, {request: xml}, function (res, status, xhr) {
        // console.log(arguments);
        // console.log("gen");
        var ress = {};
        if (res.hasOwnProperty("results")) {
            if (res.results[0].hasOwnProperty("data")) {
                for (var key in res.results[0]) {
                    if (key === "data") {
                        ress.DATA = res.results[0][key]
                    } else if (key === "data_columns") {
                        ress.NAMES = res.results[0][key]
                    } else if (key === "data_info") {
                        ress.INFO = {
                            ROWS_COUNT: res.results[0][key].rows_count,
                            VIEW_NAME: res.results[0][key].view_name
                        };
                    } else if (key === "extra_data") {
                        for (var key2 in res.results[0][key]) {
                            if (key2 === "object_profile") {
                                ress.OBJECT_PROFILE = {}
                                for (var key3 in res.results[0][key][key2]) {
                                    if (key3 === "prepare_insert") {
                                        key4 = key3.toUpperCase();
                                        ress.OBJECT_PROFILE[key4] = {
                                            DATA: res.results[0][key][key2][key3].data,
                                            NAMES: res.results[0][key][key2][key3].data_columns
                                        };
                                    } else {
                                        key4 = key3.toUpperCase();
                                        ress.OBJECT_PROFILE[key4] = res.results[0][key][key2][key3]
                                    }
                                }
                            } else {
                                key5 = key2.toUpperCase();
                                ress[key5] = res.results[0][key][key2];
                            }
                        }
                    }
                }
            } else {
                for (var key in res.results[0]) {
                    var key2 = key.toUpperCase();
                    if (key === "toastr") {
                        ress["TOAST_TYPE"] = res.results[0][key].type
                        ress["MESSAGE"] = res.results[0][key].message
                        ress["TITLE"] = res.results[0][key].title
                    } else if (key === "code") {
                        ress.RC = res.results[0][key]
                    } else {
                        ress[key2] = res.results[0][key]
                    }
                }
            }
        }
        if (ress && status && status === "success" && typeof ress === "object") {
            if (ress.hasOwnProperty("RC")) {
                if (parseInt(ress.RC) === 0) {
                    if(ress.TICKET_PACK_USER_INFO){
                        var JSONstring = ress.TICKET_PACK_USER_INFO;
                        var userInfo = new userInfoClass({JSONstring:JSONstring}).userInfo_Refresh();
                    }
                    if(typeof callback == "function"){callback(ress);}
                } else if (parseInt(ress.RC) === -2) {
                    toastr ? toastr[ress.TOAST_TYPE](ress.MESSAGE) : alert("Ваша сессия не актульна, зайдите на сайт пожалуйста заново, MB.Core.sendQuery");
                    setTimeout(function () {
                        $.removeCookie("sid");
                        document.location.href = "login.html";
                    }, 3000);
                } else {
                    if(typeof callback == "function"){callback(ress);}
                    // toastr ? toastr[res.TOAST_TYPE](res.MESSAGE, res.TITLE) : alert("Ошибка: " + res.RC + ": " + res.MESSAGE + ", MB.Core.sendQuery");
                }
            } else {
                if(typeof callback == "function"){callback(ress);}
            }
        }
    });
};
jsonToObj = function(obj){
    var obj_true = {};
    var objIndex = {};
    if(obj['DATA']!=undefined){
        for (i in obj['DATA']){
            for(var index in obj['NAMES']){
                if(obj_true[i] == undefined){obj_true[i] = {};}
                obj_true[i][obj['NAMES'][index]] = obj['DATA'][i][index];
            }
        }
    }
    else if(obj['data']!=undefined) {
        for (i in obj['data']){
            if(obj['names']!=undefined){
                for(var index in obj['names']){
                    if(obj_true[i] == undefined){obj_true[i] = {};}
                    obj_true[i][obj['names'][index]] = obj['data'][i][index];
                }
            }else if(obj['data_columns']!=undefined){
                for(var index in obj['data_columns']){
                    if(obj_true[i] == undefined){obj_true[i] = {};}
                    obj_true[i][obj['data_columns'][index]] = obj['data'][i][index];
                }
            }

        }
    }

    return obj_true;
};
cloneObj = function(obj){
    if(obj == null || typeof(obj) != 'object'){
        return obj;
    }
    var temp = {};
    for(var key in obj){
        temp[key] = cloneObj(obj[key]);
    }
    return temp;
};
