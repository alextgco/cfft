var fileLoader;
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
                cb(result);
            },
            403: function (result) {
                console.log('200', result);
                cb(result);
            }
        }
    });
};
$(document).ready(function(){
    $(document).on('delivery.connect', function(e, delivery){
        console.log('triggered delivery.connect');
        fileLoader = new FileLoader({delivery:delivery});

        $('.autoUpload').off('click').on('click', function(){
            var inp = $(this);
            if (!fileLoader){
                toastr['error']('fileLoader еще не готов');
                return;
            }
            fileLoader.start({
                success:function(fileUID){
                    inp.val(fileUID.name);
                }
            });
        });
    });



    console.log('document READY');
    $("#btn1").off('click').on('click',function(){
        var o = {
            command:"add",
            object:"action_part",
            params:{
                title:"action part title",
                description:"sdfds",
                action_id: 3
            }
        };
        sendQuery(o,function(r){console.log(r);});
    });
    $("#btn2").off('click').on('click',function(){
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
    $("#btn3").off('click').on('click',function(){
        var o = {
            command:"remove",
            object:"action",
            params:{
                id:7
            }
        };
        sendQuery(o,function(r){console.log(r);});
    });
    $("#btn4").off('click').on('click',function(){
        console.log('btn4 clicked');
        var o = {
            command:"get",
            object:"action",
            params:{}
        };
        sendQuery(o,function(r){console.log(r);});
        var o = {
            command:"get",
            object:"action",
            params:{
                where:{
                    id:'3'
                }
            }
        };
        sendQuery(o,function(r){console.log(r);});
    });

    $("#btn5").off('click').on('click',function(){
        if (!fileLoader){
            console.log('fileLoader еще не готов');
            return;
        }
        fileLoader.start({
            success:function(fileUID){
                //console.log(fileUID);
            }
        });
    });





});
