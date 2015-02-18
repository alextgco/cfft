var moment = require('moment');
module.exports = {
    formatResponse:function(code,type,message,data){
        code = code || 0;
        return {
            code:code,
            toastr:{
                type:type,
                message:message
            },
            data:data
        };
    },
    getDataTimeMySQL:function(){
        return moment().format('YYYY-MM-DD HH:mm:ss');
    },
    getDataMySQL:function(){
        return moment().format('YYYY-MM-DD');
    }
};