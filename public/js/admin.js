var sendQuery = function (obj, cb) {
    if (typeof obj.params=="object"){
        obj.params = JSON.stringify(obj.params);
    }
    $.ajax({
        url: "/admin/api",
        method: "POST",
        data: obj,
        complete: function (res) {
            console.log('complete', res);
        },
        statusCode: {
            200: function (result) {
                console.log('200', result);

            },
            403: function (result) {
                console.log('200', result);
            }
        }
    });
};
$(document).ready(function(){
    $("#btn1").on('click',function(){
        var o = {
            command:"add",
            object:"action",
            params:{
                title:"TEST ACTION 2",
                description:"sdfds",
                cost:"1000",
                payment_type_id:1
            }
        };
        sendQuery(o,function(r){console.log(r);});
    });
    $("#btn2").on('click',function(){
        var o = {
            command:"modify",
            object:"action",
            params:{
                id:5,
                title:"NEW VALUE ACTION 2",
                description:"sdfds",
                cost:"1100"
            }
        };
        sendQuery(o,function(r){console.log(r);});
    });
    $("#btn3").on('click',function(){
        var o = {
            command:"remove",
            object:"action",
            params:{
                id:7
            }
        };
        sendQuery(o,function(r){console.log(r);});
    });
    $("#btn4").on('click',function(){
        var o = {
            command:"get",
            object:"action_part",
            params:{}
        };
        sendQuery(o,function(r){console.log(r);});
    });
});
