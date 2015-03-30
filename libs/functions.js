var moment = require('moment');

var funcs = {
    formatResponse: function (code, type, message, data) {
        code = code || 0;
        var o = {
            code: code,
            toastr: {
                type: type,
                message: message
            }
        };
        if (data){
            o.data = data;
            if (!isNaN(data.count)){
                o.totalCount = data.count;
                delete data.count;
            }
        }

        return o;
    },
    getDateTimeMySQL: function (d) {
        if (d){
            if (moment(d,'DD.MM.YYYY').isValid()){
                return moment(d,'DD.MM.YYYY').format('YYYY-MM-DD HH:mm:ss');
            }else{
                return d;
            }
        }
        return moment().format('YYYY-MM-DD HH:mm:ss');
    },
    getDateMySQL: function () {
        return moment().format('YYYY-MM-DD');
    },
    dateAmoreB: function (a,b) {
        var a1 = moment(a);
        var b1 = moment(b);
        return a1 >= b1;
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
            return arr;
        }
        return arr.toString();
    },
    age: function(val){
        if (!moment(val).isValid()){
            return val;
        }
        var a = moment(val);
        var b = moment();
        return b.diff(a,'years');
    },
    userFriendlyDate: function(val){
        if (!moment(val).isValid()){
            return val;
        }
        var a = moment(val).format('DD.MM.YYYY');
        return a;
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

    },
    validation:{
        isDate:function(val){
            return moment(val).isValid();
        },
        notNull:function(val){
            return (val!='');
        },
        number:function(val){
            if (val===''){
                return false;
            }
            return !isNaN(+val);
        },
        url:function(val){
            var regExp = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?/;
            return regExp.test(val);
        },
        email:function(val){
            var regExp = /^([\w\._]+)@\1\.([a-z]{2,6}\.?)$/;
            return regExp.test(val);
        }
    }



};
module.exports = funcs;