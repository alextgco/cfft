
var sendQuery2 = function (obj) {
    socket2.emit("query", obj);
};

var makeQuery = function (options, callback) {
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
};

var timer =[];
var start = function(params){
    timer.push(

        setInterval(function(){
            $("#sended").val(+$("#sended").val()+1);
            var xml = makeQuery(params.params);
            console.log(xml);
            sendQuery2(xml);
        },params.interval)
    );
    socket2.on('sendQueryResponse', function (data) {
        console.log($("#responsed").val()+1);
        var result = (params.substrResponse!=0 && !isNaN(+params.substrResponse))? data.substr(0,+params.substrResponse) : data;
        var s =  $("#response").html();
        $("#response").html(result + s);
        $("#responsed").val(+$("#responsed").val()+1);
    });

};
var stop = function(){
    for (var k in timer){
        clearInterval(timer[k]);
    }
};
$(document).ready(function(){
    $("#start").on('click',function(){
        var sid = $("#sid").val();
        var command = $("#command").val();
        var object = $("#object").val();
        var paramName1 = $("#paramName1").val();
        var paramVal1 = $("#paramVal1").val();
        var paramName2 = $("#paramName2").val();
        var paramVal2 = $("#paramVal2").val();
        var interval = $("#interval").val();
        var substrResponse = $("#substr").val();
        var responce = $("#responce").val();

        var params = {};
        if (paramName1!="") params[paramName1] = paramVal1;
        if (paramName2!="") params[paramName2] = paramVal2;
        start({interval:interval,substrResponse:substrResponse,params:{command:command,object:object,sid:sid,params:params}});

    });
    $("#stop").on('click',function(){
       stop();
    });



});