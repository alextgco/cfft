
function repertoire_init(){
    var instance = MB.O.contents["repertoire"];
    //var environment = MB.Content.find(id);
    var environment = {};
    /*instance.custom = function (callback) {
        //console.log(instance);
        callback();
    };*/
    var table = new MB.Table({
        world: "content_repertoire",
        /*name: instance.profile.general.childobject,*/
        name: "table_repertoire",
        params: {
            parentkeyvalue: instance.activeId,
            parentobject: instance.name,
            parentobjecttype: "content"}
    });
    table.create(function () {
        $("#table_repertoire tr").on("click",function(){
            var id = $(this).data("row");
            if (environment.selectedRow==id) return;
            MB.Core.sendQuery({command:"get",object:"action_price_info",sid:MB.User.sid,params:{action_id:id}},function(data){
                var obj = MB.Core.jsonToObj(data);

                var price = '';
                var count = '';
                for (var k in obj){
                    price+='<th class="one_price">' +

                        '<div class="one_price_color" style="background-color: '+obj[k].COLOR+';"></div>' +
                        '<div class="one_price_name">'+obj[k].PRICE+'</div>'+
                        '</th>';

                    count+='<td class="one_count">'+obj[k].FREE_PLACE_COUNT+'</td>';

                }

                $("#box_for_action_free_place_info").html('<thead><tr>'+price+'</tr></thead>'+'<tbody><tr>'+count+'</tr></tbody>');
                //$("#total_free_count").html(data.TOTAL_FREE_COUNT);
                environment.selectedRow = id;
            });
        });
        /*$("#table_repertoire tr").on("click",function(){
            var id = $(this).data("row");
            if (environment.selectedRow==id) return;
            MB.Core.sendQuery({command:"get",object:"action_price_info",sid:MB.User.sid,params:{action_id:id}},function(data){
                var obj = MB.Core.jsonToObj(data);

                var price = '';
                var count = '';
                for (var k in obj){
                    price+='<div class="one_price">' +
                                '<div class="one_price_name">'+obj[k].PRICE+'</div>'+
                                '<div class="one_price_color" style="background-color: '+obj[k].COLOR+';"></div>' +
                                '</div>';

                    count+='<div class="one_count">'+obj[k].FREE_PLACE_COUNT+'</div>';

                }

                $("#box_for_action_free_place_info_price").html(price);
                $("#box_for_action_free_place_info_count").html(count);
                //$("#total_free_count").html(data.TOTAL_FREE_COUNT);
                environment.selectedRow = id;
            });
        });*/
    });

}