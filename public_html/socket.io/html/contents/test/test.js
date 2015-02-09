/*var sid = MBOOKER.UserData.sid;

var fundZones_map;*/



/*function fundZones_content_resize(){

}*/
$(document).ready(function(){
    //fundZones_init();
});



function test_init(id){
    var environment = MB.Content.find(id);
    var test_map;
    var sid = MB.User.sid;

    test_map = new Map1({
        container:$("#test"),
        cWidth:1000,
        cHeight:600
    });


    var o = {
        command:"get",
        object:"hall_scheme_pricezone_item",
        sid:sid,
        params:{
            price_zone_id:138
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
    test_map.openSocket({type:"hall_scheme_pricezone_item",param:"price_zone_id",id:138});
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



}
