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
    }
};