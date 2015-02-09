$(document).ready(function(){


    $("#FastSearch").select2({
        placeholder: "search",
        minimumInputLength: 1,
        ajax: {
            url: "/cgi-bin/b2cJ",
            dataType: "json",
            data: function (term) {
                var options = {
                    command: "get",
                    object: "main_search",
                    sid: MB.User.sid,
                    where:"obj_id like '|percent|"+term+"|percent|'"
                };
                return {p_xml: MB.Core.makeQuery(options)};
            },
            results: function (data) {
                var obj = MB.Core.jsonToObj(data);
                var res = [];
                for (i in obj){
                    res.push({id: obj[i]['OBJ_ID']+"||"+obj[i]['OPEN_FORM_CLIENT_OBJECT'], text: obj[i]['OBJ_TYPE_RU']+" "+obj[i]['INFO']});
                }
                return {results: res}
                /*
                var res = [];
                res.push({id: res.DATA[i][0], text: res.DATA[i][1]});
                */
                //return {results: data.movies};
                //return {results: MB.Table.parseforselect2data(data)};
            }
        }
    });

    $("#FastSearch").on("change", function(e) {
        $(".sidebar-search").find(".select2-chosen").html("Search...");
        var arr = e.val.split("||");
        var ids = [arr[0]];
        var formName = arr[1];
        MB.Core.switchModal({ 
            type: "form", 
            ids: arr, 
            name: formName,
            params:{
                where: "ORDER_TICKET_ID = "+arr[0]
            }
        });
    })
/*
    $("#FastSearch").change(function () {
        var data = $("#e8").select2("data");
        log(data)
    });
*/

    
//    $(".sidebar-search").find("")

    // $("#e8").select2("val");


    /*
    $("div.sidebar-search input").keyup(function(e){
        if(e.keyCode == 13){
            var val = $(this).val();
            MB.Core.sendQuery({command:"get",object:"main_search",sid:MB.User.sid,params:{where:"obj_id like '|percent|"+val+"|percent|'"}},function(result){
                var obj = MB.Core.jsonToObj(result);
                var html = '';
                for(var i in obj){
                    html+= ''+
                    '<div>'+
                        '<span>'+obj[i]['OBJ_ID']+'</span>'+
                        '<span>'+obj[i]['OBJ_TYPE_RU']+'</span>'+
                        '<span>'+obj[i]['INFO']+'</span>'+
                    '</div>';
                }
                $(".searchResult").html(html);
            });

            App.init();
            FormEditable.init();
        }
    });
        */
        /*
        if(e.keyCode == 13){
            var val = $(this).val();
            $("div.sidebar-search input").select2({
                placeholder: val,
                minimumInputLength: 1,
                ajax: {
                    url: "/cgi-bin/b2cJ",
                    dataType: "json",
                    data: function (term, page) {
                        var options = {
                            command: "get",
                            object: "main_search",
                            sid: MB.User.sid,
                            where:"obj_id like '|percent|"+val+"|percent|'"
                        };
                        return {p_xml: MB.Core.makeQuery(options)};
                    },
                    results: function (data, page) {
                        //return {results: MB.Table.parseforselect2data(data)};
                    }
                }
                // tags:["red", "green", "blue"],
            });
        }
        */
    
});
