
/*environment.reload = function(d){
    log("priceZones ReLoaded");
};*/







//priceZones_init();
function priceZones_init(id){

    var environment = MB.Content.find(id);
    var priceZones_map;
    var sid = MBOOKER.UserData.sid;

    environment.select_price  = {};
    environment.select_pricing = {};
    environment.selected_group = 0;
    var price_zone_pricing_id;

    //priceZones_map.shiftState = 0;


    function loadPriceZoneById(price_zone_id){
        if (isNaN(+price_zone_id) || price_zone_id == "") return;
        MB.Core.sendQuery({command:"get",object:"hall_scheme_pricezone",sid:sid,params:{where: "price_zone_id = "+price_zone_id}},function(data){
            //var obj = xmlToObject(data,"ROW");
            var obj = MB.Core.jsonToObj(data);
            $("#hall_scheme_pricezone").html(obj[0].NAME);
        });
    }
    function loadPricingById(pricing_id){
        if (isNaN(+pricing_id) || pricing_id == "") return;
        MB.Core.sendQuery({command:"get",object:"price_zone_pricing",sid:sid,params:{where: "price_zone_pricing_id = "+pricing_id}},function(data){
            //var obj = xmlToObject(data,"ROW");
            var obj = MB.Core.jsonToObj(data);
            $("#pricing_select").html(obj[0].NAME);
        });
    }


    function loadPriceZoneGroups(){
        /// загрузка ценовых групп
        if (typeof environment.price_zone_id=="undefined") return;
        MB.Core.sendQuery({command:"get",object:"hall_scheme_price_group",sid:sid,params:{price_zone_id:environment.price_zone_id}},function(data){
            var obj = MB.Core.jsonToObj(data);
            var html = '';
            var PRICE_GROUP_ID,NAME,PRICE,COLOR,PLACE_COUNT,OBJVERSION;
            for (var k in obj){
                PRICE_GROUP_ID = obj[k].PRICE_GROUP_ID;
                NAME = obj[k].NAME;
                PRICE = obj[k].PRICE;
                PLACE_COUNT = obj[k].PLACE_COUNT;
                COLOR = obj[k].COLOR;
                OBJVERSION = obj[k].OBJVERSION;
                html += '<li id="one_fund_group'+PRICE_GROUP_ID+'" class="one_fund_group">' +
                            '<div class="colorCircle" style="background-color: '+COLOR +'" ></div>' +
                            '<div class="info">' +
                            '<a href="#">'+NAME+'</a>'+
                            '<span>'+PLACE_COUNT+' мест</span>' +
                            '</div>'+
                        '</li>';

                /*'<tr>'+
                    '<td class="highlight one_price_group" id="one_price_group'+PRICE_GROUP_ID+'" >'+
                    '<div class="price_color" style="border-left: 10px solid '+COLOR+';border-bottom: 0px solid '+COLOR+';"></div>'+
                    '<a href="#">'+NAME+'</a>'+
                    '</td>'+
                    '<td class="hidden-xs">'+PLACE_COUNT+'</td>'+
                '</tr>';*/

            }

            $("#TOTAL_PLACE_COUNT").html(data.TOTAL_PLACE_COUNT);
            $("#TOTAL_SELECTED_PLACE_COUNT").html(data.TOTAL_SELECTED_PLACE_COUNT);
            $("#TOTAL_NOT_SELECTED_PLACE_COUNT").html(data.TOTAL_NOT_SELECTED_PLACE_COUNT);

            $("#for_price_groups").html(html);


            $(".one_price_group").die("click").live("click", function(){
                var id = this.id.replace(/[^0-9]/ig,"");
                if(priceZones_map.shiftState==16){

                    bootbox.dialog({
                        message: "Раскрасить все этим поясом?",
                        title: "",
                        buttons: {
                            all_place: {
                                label: "Да, все места",
                                className: "green",
                                callback: function() {
                                    MB.Core.sendQuery({command:"operation",object:"fill_price_zone_by_price_group",sid:sid,params:{
                                        price_zone_id:environment.price_zone_id,
                                        price_group_id:id,
                                        all:1
                                    }},function(){
                                        loadPriceZoneGroups();
                                        loadCurrentPricing();
                                        priceZones_map.reLoad();
                                    });
                                }
                            },
                            free_only: {
                                label: "Только свободные",
                                className: "yellow",
                                callback: function() {
                                    MB.Core.sendQuery({command:"operation",object:"fill_price_zone_by_price_group",sid:sid,params:{
                                        price_zone_id:environment.price_zone_id,
                                        price_group_id:id,
                                        all:0
                                    }},function(){
                                        loadPriceZoneGroups();
                                        loadCurrentPricing();
                                        priceZones_map.reLoad();
                                    });
                                }
                            },
                            cancel: {
                                label: "Отмена",
                                className: "blue",
                                callback: function() {}
                            }
                        }
                    });


                    return;
                }

                $(".price_color").css("borderBottomWidth","0");
                $(".price_color",this).css("borderBottomWidth","2px");
                environment.selected_group = this.id.replace(/[^0-9]+/ig,'');
            });
            if (environment.selected_group!=0){
                priceZones_map.shiftState = 0;
                $("#one_price_group"+environment.selected_group).click();
            }

        });


    }


    function loadPricingList(){
        /// загрузка расценок
        if (typeof environment.price_zone_id=="undefined") return;
        MB.Core.sendQuery({command:"get",object:"hall_scheme_pricezone",sid:sid,params:{where:"price_zone_id = "+environment.price_zone_id}},function(data){
            var obj = MB.Core.jsonToObj(data);
            if (+obj[0].PRICE_ZONE_PRICING_ID==0){
                var html = 'Нет записей';
            }else{
                html = obj[0].PRICE_ZONE_PRICING_NAME;
                environment.price_zone_pricing_id = obj[0].PRICE_ZONE_PRICING_ID;
            }

            $("#pricing_select").html(html);

            $(document).on('click','#pricing_select_btn', function(){
                MB.Core.switchModal({
                    type: "form",
                    ids: [environment.price_zone_id],
                    name: "form_price_zone_pricing",
                    params:{
                        tblselectedrow:environment.price_zone_pricing_id,
                        tblcallbacks:{
                            custom1:{
                                name: "Выбрать",
                                callback: function (key, options) {
                                    MB.Modal.close("form_price_zone_pricing");
                                    environment.price_zone_pricing_id =  options.$trigger.data("row");
                                    loadPricingById(environment.price_zone_pricing_id);
                                    loadCurrentPricing();
                                }
                            }
                        }
                    }
                });
            });
            loadCurrentPricing();

        });
    }

    function loadCurrentPricing(){
        /// загрузка конкретной расценки
        MB.Core.sendQuery({command:"get",object:"price_zone_pricing_item",sid:sid,params:{where:"price_zone_pricing_id="+environment.price_zone_pricing_id}},function(data){
            var obj = MB.Core.jsonToObj(data);
            var html = '';
            var PRICE_ZONE_PRICING_ITEM_ID,PRICE_GROUP_ID,PRICE_GROUP,PLACE_COUNT,PRICE,AMOUNT,TOTAL_AMOUNT,COLOR,OBJVERSION;
            TOTAL_AMOUNT = 0;
            for (var k in obj){
                PRICE_ZONE_PRICING_ITEM_ID = obj[k].PRICE_ZONE_PRICING_ITEM_ID;
                PRICE_GROUP_ID = obj[k].PRICE_GROUP_ID;
                PRICE_GROUP = obj[k].PRICE_GROUP;
                PLACE_COUNT = +obj[k].PLACE_COUNT;
                PRICE = +obj[k].PRICE;
                AMOUNT = +obj[k].AMOUNT;
                COLOR = obj[k].COLOR;
                OBJVERSION = obj[k].OBJVERSION;



                html +=
                    '<tr class="pricing_row" id="pricing_row'+PRICE_ZONE_PRICING_ITEM_ID+'">' +
                        '<td class="highlight">' +
                        '<div class="price_color" style="background-color: '+COLOR+'"></div>' +
                        '<a href="#">'+PRICE_GROUP +'</a>'+

                        '</td>' +
                        '<td class="highlight count">' +
                        PLACE_COUNT +
                        '</td>' +
                        '<td class="highlight pricing_cell_cost_input_box cost">' +
                        /*                    '<a href="#" id="pricing_cell_cost_input'+PRICE_ZONE_PRICING_ITEM_ID+'" data-type="text" data-pk="1" data-placement="right" data-placeholder="Required" data-original-title="Enter your firstname" class="pricing_cell_cost_input editable editable-click editable-empty" style="display: inline;">' +
                         PRICE+"000L"+
                         '</a>'+*/
                        '<input type="text" class="pricing_cell_cost_input" id="pricing_cell_cost_input'+PRICE_ZONE_PRICING_ITEM_ID+'" value="'+PRICE+'">' +
                        //'<a class="pricing_cell_cost_input" id="pricing_cell_cost_input'+PRICE_ZONE_PRICING_ITEM_ID+'"  href="#">'+PRICE +'</a>'+
                        '</td>' +
                        '<td class="highlight amount"><span>' +
                        AMOUNT +
                        '</span></td>' +
                        '<input type="hidden" id="pricing_row_objversion'+PRICE_ZONE_PRICING_ITEM_ID+'" value="'+OBJVERSION+'">' +
                        '</tr>';

                TOTAL_AMOUNT += AMOUNT;
            }

            //html += ;
            $("#for_pricing_row").html(html);
            //$(".pricing_cell_cost_input").editable();

            function count_total(){
                var total_amount = 0;
                $(".pricing_row").each(function(){
                    var count = (!isNaN(+$(this).children(".count").text()))? +$(this).children(".count").text() : 0;
                    var price = (!isNaN(+$(this).children(".cost").children(".pricing_cell_cost_input").val()))? +$(this).children(".cost").children(".pricing_cell_cost_input").val() : 0;
                    total_amount += count*price;
                });
                $("#pricing_global_amount").html('Итого: '+total_amount+" руб.");



            }

            $("#pricing_global_amount").html('Итого: '+TOTAL_AMOUNT+" руб.");
            //$(".pricing_cell_cost_input").mask("?9999999999",{placeholder:''});
            $(".pricing_cell_cost_input").focus(function(){
                var self = $(this);
                window.setTimeout(function(){
                    self.select();
                },20);
            }).keyup(function(e){
                    if (e.which==13){
                        if ($(this).parents(".pricing_row").next(".pricing_row").length>0)
                            $(this).parents(".pricing_row").next(".pricing_row").children(".cost").children(".pricing_cell_cost_input").focus();
                    }
                    var count = (!isNaN(+$(this).parents(".pricing_row").children(".count").text()))? +$(this).parents(".pricing_row").children(".count").text() : 0;
                    var price = +$(this).val();
                    $(this).parents(".pricing_row").children(".amount").children("span").html(count*price);
                    count_total();
                });

        });
    }


    MB.Core.sendQuery({command:"get",object:"hall_scheme",sid:sid,params:{where:"hall_scheme_id = "+environment.hall_scheme_id}},function(data){
        var obj = MB.Core.jsonToObj(data);
        var html = '';
        if (obj[0].PRICE_ZONE_ID==""){
            html = '<span style="color:#ff0000;">Выбрать распоясовку</span>';
        }else{
            html = obj[0].PRICE_ZONE;
            //environment.select_price.selected = obj[0].PRICE_ZONE_ID;
            environment.price_zone_id = obj[0].PRICE_ZONE_ID;
            loadPriceZoneGroups();
        }




        $("#hall_scheme_pricezone").html(html).click(function(e){







            MB.Core.switchModal({
                type: "form",
                ids: [environment.hall_scheme_id],
                name: "form_hall_scheme_price_zone",
                params:{
                    tblselectedrow:environment.price_zone_id,
                    tblcallbacks:{
                        custom1:{
                            name: "Выбрать",
                            callback: function (key, options) {
                                MB.Modal.close("form_hall_scheme_price_zone");
                                environment.price_zone_id = options.$trigger.data("row");
                                priceZones_map.load({
                                        object:(typeof environment.price_zone_id!="undefined") ? "hall_scheme_pricezone_item" : "hall_scheme_item",
                                        params:(typeof environment.price_zone_id!="undefined") ? {price_zone_id:environment.price_zone_id}:{hall_scheme_id :environment.hall_scheme_id},
                                        reLoadCallback:function(){
                                            loadPriceZoneGroups();
                                        },
                                        loadObjectsParam:{
                                            object:"hall_scheme_object",
                                            params:{
                                                where:"hall_scheme_id ="+ environment.hall_scheme_id
                                            }
                                        }
                                    },function(){
                                        loadPriceZoneById(environment.price_zone_id);
                                        loadPriceZoneGroups();
                                        loadPricingList();
                                        priceZones_map.render();
                                    }
                                );
                            }
                        }

                    }

                }
            });
        });

        $("#pricing_save_btn").click(function(){
            $(".pricing_row").each(function(){
                var id = this.id.replace(/[^0-9]/ig,"");
                MB.Core.sendQuery({command:"modify",object:"price_zone_pricing_item",sid:sid,params:{price_zone_pricing_item_id:id,objversion:$("#pricing_row_objversion"+id).val(),price:+$("#pricing_cell_cost_input"+id).val()}},function(data){
                    if(data.RC==0){


                    }else{
                        bootbox.dialog({
                            message: data.MESSAGE,
                            title: "Ошибка",
                            buttons: {
                                ok: {
                                    label: "Ок",
                                    className: "red",
                                    callback: function() {}
                                }
                            }
                        });
                    }
                    loadCurrentPricing();
                });
            });
            bootbox.dialog({
                message: "Расценка успешно сохранена.",
                title: "",
                buttons: {
                    ok: {
                        label: "Ок",
                        className: "green",
                        callback: function() {}
                    }
                }
            });
        });
        $("#pricing_reset_btn").click(function(){
            loadCurrentPricing();
        });


        priceZones_map = new Map({
            box:"box_for_priceZones_map",
            name:"priceZones",
            cWidth:environment.getWidth(),
            cHeight:environment.getHeight()
        });
        priceZones_map.load({
                object:(typeof environment.price_zone_id!="undefined") ? "hall_scheme_pricezone_item" : "hall_scheme_item",
                params:(typeof environment.price_zone_id!="undefined") ? {price_zone_id:environment.price_zone_id}:{hall_scheme_id :environment.hall_scheme_id},
                reLoadCallback:function(){
                    loadPriceZoneGroups();
                },
                loadObjectsParam:{
                    object:"hall_scheme_object",
                    params:{
                        where:"hall_scheme_id ="+ environment.hall_scheme_id
                    }
                }
            },function(){
                loadPriceZoneGroups();
                loadPricingList();
                priceZones_map.render();
            }
        );





        $("div").each(function(){
            if (this.id!="")
                preventSelection(document.getElementById(this.id));
        });

    /*    priceZones_map.box.contextmenu(function(e){
            return false;
        });*/

        priceZones_map.sendSelection = function(keyBTN){

            if (priceZones_map.selection[0]==undefined) return;
            //var price_group_id = ($("#"))
            //$(".one_price_group .select_point:visible").attr("id").substr(15);
            if ($(".one_price_group .select_point:visible").length>0 && keyBTN>0)
                price_group_id = (+$(".one_price_group .select_point:visible").parent(".one_price_group").attr("id").substr(15)>0) ? +$(".one_price_group .select_point:visible").parent(".one_price_group").attr("id").substr(15) : "";
            if (+environment.selected_group<=0 && keyBTN!=0) {
                bootbox.dialog({
                    message: "Пожалуйста, выберите ценовой пояс.",
                    title: "Ценовой пояс не выбран.",
                    buttons: {
                        ok: {
                            label: "Ок",
                            className: "blue",
                            callback: function() {
                                priceZones_map.clearSelection();
                            }
                        }
                    }
                });
                return;
            }
            var price_group_id = (environment.selected_group!=0) ? environment.selected_group : "";
            if (keyBTN==0)
                price_group_id = "";

            //if (keyBTN==0) price_group_id = "";
            MB.Core.sendQuery({command:"operation",object:"change_hall_scheme_item_price_group",sid:sid,params:{price_zone_item_id:priceZones_map.selection.join(","),price_group_id:price_group_id}},function(){
                priceZones_map.selection = [];
                priceZones_map.reLoad();
                loadPriceZoneGroups();
                loadCurrentPricing();
            });

        };



    });






    $("#map_refresh").click(function(){
        priceZones_map.reLoad();

    });

    uiTabs();
    uiUl();
    inlineEditing();
    $('input[type="checkbox"]').uniform();

}




































