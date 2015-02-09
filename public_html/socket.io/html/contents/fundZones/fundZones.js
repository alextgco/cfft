


function fundZones_init(id){
    var environment = MB.Content.find(id);
    var fundZones_map;
    var sid = MB.User.sid;
    environment.selected_group = 0;

    environment.select_fund  = {};

    function loadFundZoneById(fund_zone_id){
        if (isNaN(+fund_zone_id) || fund_zone_id == "") return;
        MB.Core.sendQuery({command:"get",object:"hall_scheme_fundzone",sid:sid,params:{where: "fund_zone_id = "+fund_zone_id}},function(data){
            //var obj = xmlToObject(data,"ROW");
            var obj = MB.Core.jsonToObj(data);
            $("#hall_scheme_fundzone").html(obj[0].NAME);
        });
    }

    function loadFundGroups(){
        /// загрузка фондов
        MB.Core.sendQuery({command:"get",object:"hall_scheme_fund_group",sid:sid,params:{fund_zone_id:environment.fund_zone_id}},function(data){
            //var obj = xmlToObject(data,"ROW");
            var obj = MB.Core.jsonToObj(data);
            var html = '';
            var FUND_GROUP_ID,NAME,COLOR,PLACE_COUNT,NAME_WITH_STATUS;
            for (var k in obj){
                FUND_GROUP_ID = obj[k].FUND_GROUP_ID;
                NAME = obj[k].NAME;
                NAME_WITH_STATUS = obj[k].NAME_WITH_STATUS;
                PLACE_COUNT = obj[k].PLACE_COUNT;
                COLOR = obj[k].COLOR;
                html += '<li id="one_fund_group'+FUND_GROUP_ID+'"  class="one_fund_group">' +
                        '<div class="colorCircle" style="background-color:'+obj[k].COLOR +'" ></div>' +
                        '<div class="info">' +
                        '<a href="#">'+NAME_WITH_STATUS+'</a>'+
                        '<span>'+PLACE_COUNT+' мест</span>' +
                        '</div>'+
                        '</li>';


            }
            $("#TOTAL_PLACE_COUNT").html(data.TOTAL_PLACE_COUNT);
            $("#TOTAL_SELECTED_PLACE_COUNT").html(data.TOTAL_SELECTED_PLACE_COUNT);
            $("#TOTAL_NOT_SELECTED_PLACE_COUNT").html(data.TOTAL_NOT_SELECTED_PLACE_COUNT);
            $("#TOTAL_EXCLUDED_PLACE_COUNT").html(data.TOTAL_EXCLUDED_PLACE_COUNT);


            $("#for_fund_groups").html(html);
            $(".one_fund_group").die("click").live("click", function(){
                if(fundZones_map.shiftState==16){
                    var id = this.id.replace(/[^0-9]/ig,"");

                    bootbox.dialog({
                        message: "Раскрасить все этим фондом?",
                        title: "",
                        buttons: {
                            success: {
                                label: "Да, все места",
                                className: "green",
                                callback: function() {
                                    MB.Core.sendQuery({command:"operation",object:"fill_fund_zone_by_fund_group",sid:sid,params:{
                                        fund_zone_id:environment.fund_zone_id,
                                        fund_group_id:id,
                                        all:1
                                    }},function(){
                                        loadFundGroups();
                                        fundZones_map.reLoad();
                                    });
                                }
                            },
                            free_only: {
                                label: "Только свободные",
                                className: "yellow",
                                callback: function() {
                                    MB.Core.sendQuery({command:"operation",object:"fill_fund_zone_by_fund_group",sid:sid,params:{
                                        fund_zone_id:environment.fund_zone_id,
                                        fund_group_id:id,
                                        all:0
                                    }},function(){
                                        loadFundGroups();
                                        fundZones_map.reLoad();
                                    });
                                }
                            },
                            cancel: {
                                label: "Отмена",
                                className: "blue",
                                callback: function() {

                                }
                            }
                        }
                    });


                    return;
                }

                $(".fund_color").css("borderBottomWidth","0");
                $(".fund_color",this).css("borderBottomWidth","2px");
                environment.selected_group = this.id.replace(/[^0-9]+/ig,'');
            });

            $("#fund_manager span").click(function(){
                modal_show("fund_groups/fund_groupsModal.html",{zIndex:1003,zIndexFade:1002},null,function(){
                    loadFundGroups();
                });
            });

            if (environment.selected_group!=0)
            {
                fundZones_map.shiftState = 0;
                $("#one_fund_group"+environment.selected_group).click();
            }

        });

        uiTabs();
        uiUl();
        $('input[type="checkbox"]').uniform();
    }
    //MB.Core.sendQuery({command:"get",object:"hall_scheme_fundzone",sid:sid,params:{where: "hall_scheme_id = "+environment.hall_scheme_id+" and DEFAULT_FUND_ZONE_ID=1"}},function(data0){
    MB.Core.sendQuery({command:"get",object:"hall_scheme",sid:sid,params:{where: "hall_scheme_id = "+environment.hall_scheme_id}},function(data0){
        //var obj = xmlToObject(data,"ROW");
        var obj = MB.Core.jsonToObj(data0);
        if (+obj[0].FUND_ZONE_ID==0){
            //var html = '<div>Распределение не выбрано</div>';
            var html = '<span style="color:#ff0000;">Выбрать распределение</span>';
        }else{
            //html = '<div>'+obj[0].NAME+'</div>';
            html = obj[0].FUND_ZONE;
            environment.select_fund.selected = obj[0].FUND_ZONE_ID;
            environment.fund_zone_id = obj[0].FUND_ZONE_ID;
            loadFundGroups();
        }

        $("#hall_scheme_fundzone").html(html);
        $(document).on('click', '#hall_scheme_fundzone_btn', function(){
            MB.Core.switchModal({
                type: "form",
                ids: [environment.hall_scheme_id],
                name: "form_hall_scheme_fund_zone",
                params:{
                    tblselectedrow:environment.fund_zone_id,
                    tblcallbacks: {
                        custom1: {
                            name: "Выбрать",
                            callback: function (key, options) {
                                MB.Modal.close("form_hall_scheme_fund_zone");
                                environment.fund_zone_id = options.$trigger.data("row");
                                fundZones_map.load({
                                        object:(typeof environment.fund_zone_id!="undefined") ? "hall_scheme_fundzone_item" : "hall_scheme_item",
                                        params:(typeof environment.fund_zone_id!="undefined") ? {fund_zone_id:environment.fund_zone_id}:{hall_scheme_id :environment.hall_scheme_id},
                                        reLoadCallback:function(){
                                            loadFundGroups();
                                        },
                                        loadObjectsParam:{
                                            object:"hall_scheme_object",
                                            params:{
                                                where:"hall_scheme_id ="+ environment.hall_scheme_id
                                            }
                                        }
                                    },function(){
                                        loadFundZoneById(environment.fund_zone_id);
                                        loadFundGroups();
                                        fundZones_map.reLoad();
                                    }
                                );
                            }
                        }
                    },
                    formcallbacks:{
                        custom1: {
                            name: "Тест формы",
                            callback: function () {
                                alert("yes");
                            }
                        }
                    }
                }
            });


        });




        fundZones_map = new Map1({
            container: $("#box_for_fundZones_map"),
            cWidth:environment.getWidth(),
            cHeight:environment.getHeight()
        });


        var o = {
            command:"get",
            object:"hall_scheme_fundzone_item",
            sid:sid,
            params:{
                fund_zone_id:environment.fund_zone_id
            }
        };
        var o2 = {
            command:"get",
            object:"hall_scheme_object",
            sid:sid,
            params:{
                where:"hall_scheme_id = "+environment.hall_scheme_id
            }
        };
        fundZones_map.openSocket({type:"hall_scheme_fundzone_item",param:"fund_zone_id",id:environment.fund_zone_id});
        fundZones_map.loadSquares(o,function(){

            fundZones_map.loadObjects(o2,function(){
                fundZones_map.setLayout(function(){
                    fundZones_map.setMinMax(function(){
                        fundZones_map.setScaleCoff(function(){
                            fundZones_map.render(function(){
                                fundZones_map.reLoadLayout(function(){});
                            });

                            fundZones_map.setEvents();
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
        fundZones_map.sendSelection = function(){
            var fund_group_id = environment.selected_group;
            if (+fund_group_id<=0 && fundZones_map.mouseKey==1){
                bootbox.dialog({
                    message: "Пожалуйста, выберите фонд.",
                    title: "Фонд не выбран.",
                    buttons: {
                        ok: {
                            label: "Ок",
                            className: "blue",
                            callback: function() {
                                fundZones_map.clearSelection();
                                fundZones_map.render();
                            }
                        }
                    }
                });
                return;
            }


            if (fundZones_map.mouseKey==3) fund_group_id = "";
            var obj = {
                command:"operation",
                object:"change_hall_scheme_item_fund_group_by_list",
                sid:sid,
                params:{
                    fund_group_id:fund_group_id
                },
                list:{
                    fund_zone_item_id:fundZones_map.selection
                }
            };
            fundZones_map.toSocket(obj);

        };
        
        
        
        

        /*fundZones_map.load({
                object:(typeof environment.fund_zone_id!="undefined") ? "hall_scheme_fundzone_item" : "hall_scheme_item",
                params:(typeof environment.fund_zone_id!="undefined") ? {fund_zone_id:environment.fund_zone_id}:{hall_scheme_id :environment.hall_scheme_id},
                reLoadCallback:function(){
                    loadFundGroups();
                },
                loadObjectsParam:{
                    object:"hall_scheme_object",
                    params:{
                        where:"hall_scheme_id ="+ environment.hall_scheme_id
                    }
                }
            },function(){
                if (typeof environment.fund_zone_id!="undefined") loadFundGroups();
                fundZones_map.render();
            }
        );*/

       /* fundZones_map.sendSelection = function(keyBTN){
            if (fundZones_map.selection[0]==undefined) return;
            //if (isNaN(+environment.select_fund.selected)) {
            if (+environment.selected_group<=0 && keyBTN!=0) {

                bootbox.dialog({
                    message: "Пожалуйста, выберите фонд.",
                    title: "Фонд не выбран.",
                    buttons: {
                        ok: {
                            label: "Ок",
                            className: "blue",
                            callback: function() {
                                fundZones_map.clearSelection();
                            }
                        }
                    }
                });

                return;
            }
            var fund_group_id =  (environment.selected_group!=0) ? environment.selected_group : "";
            if (keyBTN==0)
                fund_group_id = "";

            MB.Core.sendQuery({command:"operation",object:"change_hall_scheme_item_fund_group",sid:sid,params:{fund_zone_item_id:fundZones_map.selection.join(","),fund_group_id:fund_group_id}},function(){
                fundZones_map.selection = [];
                fundZones_map.reLoad();
                loadFundGroups();

            });

        };






     *//*   var cWidth = $("#content_box").width();
        var cHeight = $("#content_box").height();*//*
        $("div").each(function(){
            if (this.id!="")
                preventSelection(document.getElementById(this.id));
        });
*/
       /* fundZones_map.box.contextmenu(function(e){
            return false;
        });*/


    });











        /*$("#go_to_price").click(function(){
            if (isNaN(+price_zone_id))
                MB.Core.sendQuery({command:"get",object:"hall_scheme",sid:sid,params:{where:"hall_scheme_id = "+environment.hall_scheme_id}},function(data){
                    //var obj = xmlToObject(data,"ROW");
                    var obj = MBOOKER.Fn.jsonToObj(data);
                    price_zone_id = obj[0].PRICE_ZONE_ID;
                    switch_content("priceZones");
                });
            else
                switch_content("priceZones");
        });*/


}
