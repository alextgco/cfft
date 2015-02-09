/*var sid = MBOOKER.UserData.sid;

var fundZones_map;*/



/*function fundZones_content_resize(){

}*/
$(document).ready(function(){
    //fundZones_init();
});



function test2_init(id){
    var environment = MB.Content.find(id);
    var test_map;
    var sid = MB.User.sid;

    test_map = new Map1({
        container:$("#test2"),
        cWidth:1000,
        cHeight:600
    });


    var o = {
        command:"get",
        object:"hall_scheme_fundzone_item",
        sid:sid,
        params:{
            fund_zone_id:205
        }
    };
    var o2 = {
        command:"get",
        object:"hall_scheme_object",
        sid:sid,
        params:{
            where:"hall_scheme_id = 1"
        }
    };
    test_map.openSocket({type:"hall_scheme_fundzone_item",param:"fund_zone_id",id:205});
    test_map.loadSquares(o,function(){

        test_map.loadObjects(o2,function(){
            test_map.setLayout(function(){
                test_map.setMinMax(function(){
                    test_map.setScaleCoff(function(){
                        test_map.render(function(){
                            test_map.reLoadLayout(function(){log("reloaded")});
                        });

                        test_map.setEvents();
                    });

                });
            });
        });
    });
    var wrap = $("#"+environment.world+"_"+environment.id+"_wrapper");
    wrap.children("*").each(function(){
        if (this.id!="")
            preventSelection(document.getElementById(this.id));
    });
    test_map.sendSelection = function(){
        var fund_group_id = 1;
        if (test_map.mouseKey==3) fund_group_id = "";
        var obj = {
            command:"operation",
            object:"change_hall_scheme_item_fund_group",
            sid:sid,
            params:{
                fund_group_id:fund_group_id
            },
            list:{
                fund_zone_item_id:test_map.selection
            }
        };
        test_map.toSocket(obj);
    }



}
