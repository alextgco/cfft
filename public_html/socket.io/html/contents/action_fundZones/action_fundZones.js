

function action_fundZones_init(id){
    var environment = MB.Content.find(id);
    var action_fundZones_map;
    var sid = MB.User.sid;
    environment.selected_group = 0;

    environment.select_fund  = {};



    function loadFundGroups(){
        /// загрузка фондов
        MB.Core.sendQuery({command:"get",object:"fund_group_for_action_scheme",sid:sid,params:{action_id:environment.action_id}},function(data){
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
                html += '<li id="one_fund_group'+FUND_GROUP_ID+'" class="one_fund_group">' +
                            '<div class="colorCircle" style="background-color:'+COLOR+'" ></div>' +
                            '<div class="info">' +
                                '<a href="#">'+NAME_WITH_STATUS+'</a>'+
                                '<span>'+PLACE_COUNT+' мест</span>' +
                            '</div>'+
                        '</li>';


                    /*'<tr>'+
                    '<td class="highlight one_fund_group" id="one_fund_group'+FUND_GROUP_ID+'" >'+
                    '<div class="fund_color" style="border-left: 10px solid '+COLOR+';border-bottom: 0px solid '+COLOR+';"></div>'+
                    '<a href="#">'+NAME_WITH_STATUS+'</a>'+
                    '</td>'+
                    '<td class="hidden-xs">'+PLACE_COUNT+'</td>'+
                    '</tr>';*/




                /* html += '<div class="one_fund_group" id="one_fund_group'+FUND_GROUP_ID+'" style="background-color:'+COLOR+';">' +
                 '<div class="select_point"></div>'+
                 '<span>'+NAME_WITH_STATUS+'</span>' +
                 '<span class="pf_right">'+PLACE_COUNT+'</span>' +
                 '</div>';*/
            }
            $("#TOTAL_PLACE_COUNT").html(data.TOTAL_PLACE_COUNT);
            $("#TOTAL_SELECTED_PLACE_COUNT").html(data.TOTAL_SELECTED_PLACE_COUNT);
            $("#TOTAL_NOT_SELECTED_PLACE_COUNT").html(data.TOTAL_NOT_SELECTED_PLACE_COUNT);
            $("#TOTAL_EXCLUDED_PLACE_COUNT").html(data.TOTAL_EXCLUDED_PLACE_COUNT);


            $("#for_fund_groups").html(html);
            $(".one_fund_group").die("click").live("click", function(){
                if(action_fundZones_map.shiftState==16){
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
                                        action_fundZones_map.reLoad();
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
                                        action_fundZones_map.reLoad();
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
                action_fundZones_map.shiftState = 0;
                $("#one_fund_group"+environment.selected_group).click();
            }

        });
    }







    //MB.Core.sendQuery({command:"get",object:"hall_scheme_fundzone",sid:sid,params:{where: "hall_scheme_id = "+environment.hall_scheme_id+" and DEFAULT_FUND_ZONE_ID=1"}},function(data0){
    MB.Core.sendQuery({command:"get",object:"action",sid:sid,params:{where: "action_id = "+environment.action_id}},function(data0){
        var obj = MB.Core.jsonToObj(data0);
        environment.hall_scheme_id = obj[0].HALL_SCHEME_ID;


        action_fundZones_map = new Map({
            box:"box_for_action_fundZones_map",
            name:"action_fundZones",
            cWidth:environment.getWidth(),
            cHeight:environment.getHeight()
        });

        action_fundZones_map.load({
                object:"action_scheme_fund_group",
                params:{action_id:environment.action_id},
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
                if (typeof environment.action_id!="undefined") loadFundGroups();
                action_fundZones_map.render();
            }
        );

        action_fundZones_map.sendSelection = function(keyBTN){
            if (action_fundZones_map.selection[0]==undefined || keyBTN!=1) {
                action_fundZones_map.clearSelection();
                return;
            }
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
                                action_fundZones_map.clearSelection();
                            }
                        }
                    }
                });

                return;
            }
            var fund_group_id =  (environment.selected_group!=0) ? environment.selected_group : "";
            if (keyBTN==0)
                fund_group_id = "";


            bootbox.dialog({
                message: "Перевод выделеных мест в другой фонд может повлиять на доступность для продажи этих мест.<br>" +
                    "Эта операция будет применена только для свободных на текущий момент мест.<br>" +
                    "Вы уверены, что хотите выполнить перераспределение?",
                title: "<span style='color:#f00;'>Перераспределение.</span>",
                buttons: {
                    ok: {
                        label: "Выполнить перераспределение",
                        className: "red",
                        callback: function() {
                            MB.Core.sendQuery({command:"operation",object:"change_action_scheme_fund_group",sid:sid,params:{action_scheme_id:action_fundZones_map.selection.join(","),fund_group_id:fund_group_id}},function(){
                                action_fundZones_map.selection = [];
                                action_fundZones_map.reLoad();
                                loadFundGroups();

                            });
                        }
                    },
                    cancel: {
                        label: "Отмена",
                        className: "green",
                        callback:function(){
                            action_fundZones_map.selection = [];
                            action_fundZones_map.reLoad();
                        }
                    }
                }
            });



        };






        $("div").each(function(){
            if (this.id!="")
                preventSelection(document.getElementById(this.id));
        });



    });

    uiTabs();
    uiUl();
    inlineEditing();
    $('input[type="checkbox"]').uniform();

}
