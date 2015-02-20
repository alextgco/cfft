var moment = require('moment');
module.exports = {
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
        for (var key in obj) {
            temp[key] = this.cloneObj(obj[key]);
        }
        return temp;
    },
    cloneArray: function(arr){
        if (arr == null || typeof(arr) != 'object') {
            return arr;
        }
        var tmp = [];
        for (var i in arr) {
            tmp.push(arr[i]);
        }
        return tmp;
    }
};