var funcs = {
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
exports.functions = funcs;