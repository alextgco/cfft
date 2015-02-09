// "M207.8721324350939 27.917826920259323Q446.717838156399 32.35801629619725 697.399154427173 28.293540358259147C728.4574858652891 26.879503669871788 739.3640354115346 46.57634039943249 738.9979073128364 68.310207767613Q736.183031031041 222.51459110637822 724.8272712074668 431.9775942002012C725.8975804350478 466.0694784282333 716.2212511422277 468.85114399523 714.5967238030761 473.1512572414507C759.9782139308417 482.0423968880772 761.6350454138384 537.7279818981585 768.2270365134065 572.5477199864122C780.8273807948459 651.3315793520422 774.8659794687167 786.0475625285775 737.1572794378717 807.715886245039C699.3796580112419 830.8995063695895 555.821806114115 858.1093414717326 452.672308141119 865.3448080644633C354.685502981642 854.2243436652541 189.99930596978263 823.0828743930684 159.42486324448106 791.8210441457624C130.12700722230318 762.1985117105605 124.80377709111514 615.6430448164913 155.63616981752497 510.70380617856466C163.26817839724507 489.15230476915104 178.15898645081157 472.4310493167233 193.2175133439342 475.1722756368512C169.40609631700477 451.6596560936715 173.76871717944056 202.98182751180946 168.06555139304055 69.29516382967336C166.25437178244263 44.156744253571475 178.84137849788414 25.89157356644773 209.60532657075984 27.26311714312319"
// "M760.1247173881754 155.7289156084096L822.1922437425667 156.4606978430149Q854.7813248672767 157.4277759955941 858.8567933230632 186.7486087493532Q869.4871691209406 329.9441497007053 859.4942029350283 474.27847855340315Q855.8778754232743 505.4724733508581 823.6558082117779 504.4795007175952L755.7919098199437 500.52365173390376Q734.5864345589571 495.61676701766993 736.2230271840905 466.10562190637Q737.338135784496 329.8559650046867 734.0957818942298 197.33243387453618Q731.2722308785432 158.81141143093285 760.5694147434392 155.44183072906836"
// "M86.69094409376206 156.6432197465873L147.3667214449654 155.47646357043263Q173.16660607563767 157.35673254214416 174.20378456820785 185.87830555198394Q175.82434114885552 335.7508762403353 171.545492471095 471.5561914133008Q170.37817927104518 503.90281269640803 144.25462894335942 501.3752123306698L73.2726910440883 502.9312585814729Q47.731961780584754 503.3845019620706 46.82491799549391 477.2609516343848Q41.379870165473776 323.3047343294921 49.80687578962032 187.0456187520337Q54.473343470343984 161.18066676762143 87.72812258633232 155.60604125401701"
//var sid = "";



function ForExperiment_init(id){
    var ForExperiment_map;
    var sid = MB.User.sid;
    //var environment = MBOOKER.Fn.getEnv("one_action");
    var environment = MB.Content.find(id);
    //log("Height: "+environment.getHeight());
    var tickets_stack,action_price_info;



    //environment.action_id = 14;

    $("div").each(function(){
            if (this.id!="")
         preventSelection(document.getElementById(this.id));
    });

    //preventSelection(document.getElementsByTagName("div"));

     ForExperiment_map = new MapExp({
         box:"box_for_ForExperiment_map",
         box2:"box_for_ForExperiment_zoom",
         name:"ForExperiment",
         cWidth:994+410,
         cHeight:550+10
     });
    ForExperiment_map.load({
            object:"hall_scheme_item",
            params:{hall_scheme_id :environment.hall_scheme_id},
            loadObjectsParam:{
                object:"hall_scheme_object",
                params:{
                    where:"hall_scheme_id ="+ environment.hall_scheme_id
                }
            },
            reLoadCallback:function(){
                //tickets_stack.load();
                //action_price_info.load();
            }
        },function(){
/*            tickets_stack.load();
            action_price_info.load();*/
            $("a.reload").click(function(){
                ForExperiment_map.reLoad();
               /* tickets_stack.load();
                action_price_info.load();*/
            });
        }
     );









  /*  ///  Стек билетов
    tickets_stack = {
        box:"tickets_box",
        load:function(){
            if (environment.order_id==undefined){
                var self = this;
                MB.Core.sendQuery({command:"get",object:"user_blocked_places",sid:MB.User.sid,params:{order_by:"ACTION_NAME,LINE,PLACE"}},function(data){
                    $("#"+self.box).html("");
                    var obj = MB.Core.jsonToObj(data);
                    for (var k in obj){
                        $("#"+self.box).append('<tr class="one_place" id="one_place'+obj[k].ACTION_SCHEME_ID+'">' +
                            '<td style="font-size: 0.8em;">' +
                            obj[k].ACTION_NAME+
                            '</td>' +
                            '<td style="font-size: 0.8em;">' +
                            obj[k].AREA_GROUP+
                            '</td>' +
                            '<td>' +
                            obj[k].LINE+
                            '</td>' +
                            '<td>' +
                            obj[k].PLACE+
                            '</td>' +
                            '<td>' +
                            obj[k].PRICE+
                            '</td>' +
                            '</tr>');


                        var items = {
                            cancel:{
                                name:"Снять блокировку места",
                                callback:function(key,options){
                                    var id = options.selector.replace(/[^0-9]/ig,'');
                                    bootbox.dialog({
                                        message: "После снятия блокировки, место станет доступно для продажи другими пользователями.",
                                        title: "Вы уверены что хотите снять блокировку места?",
                                        buttons: {
                                            yes_btn: {
                                                label: "Да, уверен",
                                                className: "yellow",
                                                callback: function() {
                                                    MB.Core.sendQuery({command:"operation",object:"unblock_place_list",sid:sid,params:{action_scheme_id:id}},function(data){
                                                        ForExperiment_map.reLoad();
                                                       *//* tickets_stack.load();
                                                        action_price_info.load();*//*
                                                    });
                                                }
                                            },
                                            cancel:{
                                                label:"Отмена",
                                                className:"blue"
                                            }
                                        }
                                    });

                                }

                            }
                        };
                        if (obj[k].ACTION_ID==environment.action_id){
                            items.showOnScheme = {
                                name: "Показать на схеме",
                                callback:function(key,options){
                                    var id = options.selector.replace(/[^0-9]/ig,'');
                                    ForExperiment_map.drawLightOne(id);
                                }
                            }
                        }
                        //log($("#one_place"+obj[k].ACTION_SCHEME_ID));
                        $.contextMenu("destroy","#one_place"+obj[k].ACTION_SCHEME_ID);
                        $.contextMenu({
                            selector:"#one_place"+obj[k].ACTION_SCHEME_ID,
                            items:items
                        });
                    }
                    $("#TOTAL_PLACE").html(data.INFO.ROWS_COUNT);
                    $("#TOTAL_TICKETS").html(data.TOTAL_TICKETS);
                    var TOTAL_AMOUNT = (data.TOTAL_AMOUNT!="")?data.TOTAL_AMOUNT:0;
                    $("#TOTAL_AMOUNT").html(TOTAL_AMOUNT+" руб.");



                });
            }


        },
        clear_blocked_place:function(){
            //clear_blocked_place
            MB.Core.sendQuery({command:"operation",object:"clear_blocked_place",sid:sid,params:{action_id:environment.action_id}},function(data){
                ForExperiment_map.reLoad(function(){
                  *//*  tickets_stack.load();
                    action_price_info.load();*//*
                });

            });
        },
        clear_blocked_placeAll:function(){
            //clear_blocked_place
            MB.Core.sendQuery({command:"operation",object:"clear_blocked_place",sid:sid},function(data){
                ForExperiment_map.reLoad(function(){
                   *//* tickets_stack.load();
                    action_price_info.load();*//*
                });

            });
        },
        block_all_places:function(){
            var self = this;
            MB.Core.sendQuery({command:"operation",object:"block_all_places",sid:sid,params:{action_id:environment.action_id}},function(data){
                ForExperiment_map.reLoad();
               *//* tickets_stack.load();
                action_price_info.load();*//*
            });
        }
    };

    /// Инфо о свободных местах
    action_price_info = {
        box:"action_price_info",
        load:function(){
            var self = this;
            MB.Core.sendQuery({command:"get",object:"action_price_info",sid:MB.User.sid,params:{action_id:environment.action_id}},function(data){
                var obj = MB.Core.jsonToObj(data);
                $("#"+self.box).html("");
                for (var k in obj){
                    $("#"+self.box).append('' +
                        '<tr>'+
                        '<td class="highlight" width="70%">'+
                        '<div class="price_color" style="border-left: 10px solid '+obj[k].COLOR+';border-bottom: 0px solid '+obj[k].COLOR+';"></div>'+
                        '<a href="#">'+obj[k].PRICE+' руб.</a>'+
                        '</td>'+
                        '<td class="hidden-xs">'+obj[k].FREE_PLACE_COUNT+'</td>'+
                        '</tr>'
                    );
                }
                $("#total_free_count").html(data.TOTAL_FREE_COUNT);

            });

        }
    };



*/








    /// Очистить стек билетов
    $("#clear_tickets_stack").click(function(){
        bootbox.dialog({
            message: "Вы уверены что хотите отменить выбор мест?",
            title: "",
            buttons: {
                yes_btn: {
                    label: "Да, уверен",
                    className: "green",
                    callback: function() {
                        tickets_stack.clear_blocked_place();
                    }
                },
                yes_to_all: {
                    label: "Да, для всех залов",
                    className: "red",
                    callback: function() {
                        tickets_stack.clear_blocked_placeAll();
                    }
                },
                cancel:{
                    label:"Отмена",
                    className:"blue"
                }
            }
        });


    });





    $("#prepare_order").on("click", function(){
        var params = {};
        var object = "reserv_order";
        if (typeof selected_order_id != "undefined") {
            object = "add_tickets_to_order";
            params = {ORDER_ID:selected_order_id};
        }
        MB.Core.sendQuery({command:"operation",object:object,sid:sid,params:params}, function(data){
            if (+data.RC == 0) {
                ForExperiment_map.reLoad();
               /* tickets_stack.load();*/

                bootbox.dialog({
                    message: "Заказ №"+data.ID+" успешно создан. Вы можете перейти к заказу или продолжить работу со схемой.",
                    title: "",
                    buttons: {
                        to_order: {
                            label: "Перейти к закзау",
                            className: "green",
                            callback:function(){
                                MB.Core.switchModal({type:"form",name:"form_order",ids:[data.ID]});
                            }

                        },
                        close: {
                            label: "Закрыть",
                            className: "blue"

                        }
                    }
                });

            } else {
                bootbox.dialog({
                    message: data.MESSAGE,
                    title: "Ошибка",
                    buttons: {
                        error: {
                            label: "Ок",
                            className: "red"

                        }
                    }
                });

            }
        });
    });





    $("#map_refresh").click(function(){
        ForExperiment_map.reLoad();
    });
    $("#block_all_places").click(function(){
        tickets_stack.block_all_places();
    });

    $("#to_action_list").click(function(){
        switch_content("actions_list",function(){
            testVisibilityminiModal("actions_list");
        });
    });

    ForExperiment_map.sendSelection = function(block){
        if (this.selection.length>0){

            var block_unblock_arr = [];
            var reserved = [];
            for (var k1 in this.selection){
                if (+this.squares[this.selection[k1]].status==1)
                    block_unblock_arr.push(this.selection[k1]);
                else if (+this.squares[this.selection[k1]].status==2)
                    reserved.push(this.selection[k1]);
            }

            var places = this.selection.join(",");
            var self = this;
            var subcmd = "block_place_list";
            if (!+block)
                subcmd = "unblock_place_list";
            MB.Core.sendQuery({command:"operation",object:subcmd,sid:sid,params:{action_scheme_id:places}},function(data){
                self.clearSelection();
                self.reLoad();
               /* tickets_stack.load();
                action_price_info.load();*/
                //self.reLoad();
            });
            for(var k2 in reserved){
                MB.Core.sendQuery({command:"operation",object:"cancel_ticket",sid:sid,params:{action_scheme_id:reserved[k2]}},function(data){})
            }
        }
    };


}



