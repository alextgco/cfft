var moment = require('moment');

var funcs = {
    formatResponse: function (code, type, message, data) {
        code = code || 0;
        return {
            code: code,
            toastr: {
                type: type,
                message: message
            },
            data: data
        };
    },
    getDataTimeMySQL: function () {
        return moment().format('YYYY-MM-DD HH:mm:ss');
    },
    getDataMySQL: function () {
        return moment().format('YYYY-MM-DD');
    },
    cloneObj: function (obj) {
        if (obj == null || typeof(obj) != 'object') {
            return obj;
        }
        var temp = {};
        if (obj.length){
            temp = [];
        }
        for (var key in obj) {
            temp[key] = this.cloneObj(obj[key]);
        }
        return temp;
    },
    parseBlob: function(arr){
        if (typeof arr!=='object'){
            return obj;
        }
        return obj.toString();
    },
    clearEmpty: function(arr) {
        if (typeof arr!=='object'){
            return arr;
        }
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === undefined) {
                arr.splice(i, 1);
                funcs.clearEmpty();
            }
        }
        return arr;
    }



};
module.exports = funcs;