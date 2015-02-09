
var timer =[];
var delta = 0;
var stopped = false;
var requests = [
    {
        name:"get_actions_info",
        command:"get_actions_info",
        param1Name:"action_id",
        param1Value:"937",
        param2Name:"frame",
        param2Value:"0_N5KxAQXUzWGY"
    },
    {
        name:"SLEEP",
        command:"operation",
        object:"sleep",
        param1Name:"time",
        param1Value:"10",
        param2Name:"",
        param2Value:""
    },
    {
        name:"Схема зала 1 (1700 мест)",
        command:"get",
        object:"hall_scheme_item",
        param1Name:"hall_scheme_id",
        param1Value:"1",
        param2Name:"where",
        param2Value:"ACTION_ID = 375730"
    },
    {
        name:"Активные мероприятия",
        command:"get",
        object:"action_active",
        param1Name:"hall_scheme_id",
        param1Value:"1",
        param2Name:"",
        param2Value:""
    },
    {
        name:"Билеты заказа",
        command:"get",
        object:"order_ticket",
        param1Name:"where",
        param1Value:"ORDER_ID = 1383",
        param2Name:"",
        param2Value:""
    },
    {
        name:"Схема мероприятия для iFrame",
        command:"get_action_scheme",
        object:"",
        param1Name:"action_id",
        param1Value:"1",
        param2Name:"",
        param2Value:""
    },
    {
        name:"Создание заказа ",
        command:"create_order",
        object:"",
        param1Name:"frame",
        param1Value:"dlwIiI8B4Q8kafizW74wWfHcXF48xBYWZgbIQmMjP65JelQ89g",
        param2Name:"action_id",
        param2Value:"1"
    },
    {
        name:"Блокировка мест кассиром (быстрая операция)",
        command:"operation",
        object:"block_by_cashier",
        param1Name:"action_scheme_id",
        param1Value:"375449",
        param2Name:"",
        param2Value:""
    },
    {
        name:"Загрузка места",
        command:"get",
        object:"action_scheme",
        param1Name:"action_id",
        param1Value:"622",
        param2Name:"where",
        param2Value:"action_scheme_id in(375569)"
    }



];

var start = function(params){
    var send = 0;
    var resuOk = 0;
    var resuError = 0;
    var resuAll = 0;
    timer.push(

        setInterval(function(){
            send++;
            $("#sended").val(send);
            console.log(JSON.stringify(params.params));
            socketQuery(params.params, function (data) {
                if (stopped) return;
                var res = JSON.parse(data);
                res = res['results'][0];
                var result = (params.substrResponse!=0 && !isNaN(+params.substrResponse))? data.substr(0,+params.substrResponse) : data;
                var s =  $("#responseText").html();

                if (typeof res=="object" && isNaN(+res.code)){
                    //if ($("#show_response:checked").length>0)
                        $("#responseText").text(s+"\n"+res.toastr.message);
                    resuError++;
                    $("#responsedError").val(resuError);
                }else{
                    if ($("#show_response:checked").length>0)
                        $("#responseText").text(s+"\n"+data);
                    else
                        $("#responseText").html(s+"Ок\n");
                    resuOk++;
                    $("#responsedOk").val(resuOk);
                }
                resuAll++;
                $("#responsed").val(resuAll);
            });
        },params.interval)
    );
    /*socket.on('socketQueryCallback', function (data) {
        //var res = JSON.parse(result);
        var result = (params.substrResponse!=0 && !isNaN(+params.substrResponse))? data.substr(0,+params.substrResponse) : data;
        var s =  $("#response").html();

        if (typeof result=="object" && isNaN(result.code)){
            $("#response").text(s+"\n"+result.results[0].toastr.message);
        }else{
            $("#response").html(s+"\nОк");
        }
        resu++;
        $("#responsed").val(resu);
    });*/

};
var stop = function(){
    for (var k in timer){
        clearInterval(timer[k]);
    }
    timer = [];

};

/*<input id="sended" disabled="disabled" value="0">
    <label>Получено всего:</label>
    <input id="responsed" disabled="disabled" value="0">
        <label>Получено успешных:</label>
        <input id="responsedOk" disabled="disabled" style="color:#00c800;" value="0">
            <label>Получено с ошибками:</label>
            <input id="responsedError" disabled="disabled" style="color:#f00;" value="0">
                <label>Максимальная разность:</label>
                <input id="maxDelta" disabled="disabled" style="color:#f00;" value="0">*/
var clear = function(){
    stop();
    delta = 0;
    $("#response").text("");
    $("#responseText").text("");
    $("#sended").val(0);
    $("#responsed").val(0);
    $("#responsedOk").val(0);
    $("#responsedError").val(0);
    $("#maxDelta").val(0);
    stopped = false;
};

socket.on('time',function(data){
    if (stopped) return;
    var s =  $("#response").html();
    $("#response").text(data+s+"\n");

    var d = data.match(/(Разность: \w+)/);
    var deltaNew = +d[0].replace(/[^0-9+]/ig,'');
    if (deltaNew>delta){
        delta = deltaNew;
        $("#maxDelta").val(delta);
        if (delta>120000) {
            stopped = true;
            stop();
            $("#response").text(data+"\nОстановлено.");

        }

    }

});

$(document).ready(function(){
    $("#start").on('click',function(){
        var sid = $("#sid").val();
        var command = $("#command").val();
        var object = $("#object").val();
        var paramName1 = $("#paramName1").val();
        var paramVal1 = $("#paramVal1").val();
        var paramName2 = $("#paramName2").val();
        var paramVal2 =  $("#paramVal2").val();
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
    $("#clear").on('click',function(){
        clear();
    });
    var s = "";
    for (var i in requests){
        s += '<option value="'+i+'">'+requests[i].name+'</option>';
    }
    var commands = $("#commands");
    commands.html(s);

    commands.on('change',function(){
        var index = $(this).val();
        $("#command").val(requests[index].command);
        $("#object").val(requests[index].object);
        $("#paramName1").val(requests[index].param1Name);
        $("#paramVal1").val(requests[index].param1Value);
        $("#paramName2").val(requests[index].param2Name);
        $("#paramVal2").val(requests[index].param2Value);
    });
    commands.change();



});