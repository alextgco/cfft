MB.User.socket = io.connect('http://192.168.1.101:8080');
//var socket =


MB.User.socket.on('message', function (data) {
    //  data = eval(data);
    //data = JSON.parse(data);
    console.log(data);
});

$(".news-page").html();
MB.User.socket.on('log', function (data) {
    //log(data);
    //data = $.parseJSON(data);
    console.log(data);
    //console.log(data.TOTAL_PLACE_COUNT);
});

/*
MB.User.socket.on('connect', function(){
    var delivery = new Delivery(socket);

    delivery.on('delivery.connect',function(delivery){
        $("#backgroundImageSubmit").click(function(evt){
            var file = $("#backgroundImageInput")[0].files[0];
            delivery.send(file);
            evt.preventDefault();
        });
    });

    delivery.on('send.success',function(fileUID){
        console.log("file was successfully sent.");
    });
});
*/

MB.Core.imageLoader = {
    success:function(){},
    error:function(){},
    dir:"upload/",
    inited:false,
    init:function(){

        var self = this;
        if ($("body #inputForUploadFile").length==0) $("body").append('<input type="file" style="display: none;" id="inputForUploadFile">');
        if ($("body #submitForUploadFile").length==0) $("body").append('<input type="submit" style="display: none;" id="submitForUploadFile">');
        this.inited = true;

        MB.User.socket.on('connect', function(){
            var delivery = new Delivery(MB.User.socket);

            delivery.on('delivery.connect',function(delivery){
                $("#submitForUploadFile").click(function(evt){
                    var file = $("#inputForUploadFile")[0].files[0];
                    delivery.send(file);
                    evt.preventDefault();
                });
            });

            delivery.on('send.success',function(fileUID){
                //console.log(fileUID);
                self.success(fileUID);

            });
            delivery.on('send.error',function(){
                console.log("error upload");
                self.error();
            });
        });
        $("#inputForUploadFile").on("change",function(){
            $("#submitForUploadFile").click();
        });
    },
    load:function(params){
        params = (typeof params=="object")? params : {};
        this.success = (typeof params.success=="function")? params.success : function(){};
        this.error = (typeof params.error=="function")? params.error : function(){};
        this.dir = (params.dir!==undefined)? params.dir : "upload/";
        $("#inputForUploadFile").click();
    }
};
MB.Core.imageLoader.init();



function getData(obj){
    MB.User.socket.emit('getData',obj);
}

MB.Core.socketQuery = function(obj,callback){

    MB.User.socket.on('socketQueryCallback', function (result) {
        if (typeof callback==="function"){
            callback(result);
        }
    });
    MB.User.socket.emit('socketQuery',obj);
};















